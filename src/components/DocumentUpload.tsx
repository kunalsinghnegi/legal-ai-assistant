import { useRef, useState } from "react";
import { Upload, FileText, Trash2, Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type UploadedFile = {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
};

const BUCKET = "legal-documents";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (mime: string) => {
  if (mime?.includes("pdf")) return "📄";
  if (mime?.includes("image")) return "🖼️";
  if (mime?.includes("word")) return "📝";
  return "📁";
};

const DocumentUpload = ({ clientId }: { clientId?: string }) => {
  const { user } = useAuth();
  const targetId = clientId || user?.id;
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch existing documents
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["documents", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(targetId, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter(f => f.name !== ".emptyFolderPlaceholder") as unknown as UploadedFile[];
    },
    enabled: !!targetId,
  });

  const uploadFile = async (file: File) => {
    if (!targetId) return;

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large (max 10 MB)`);
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      toast.error(`${file.name}: unsupported file type. Use PDF, JPG, PNG, or DOCX.`);
      return;
    }

    // Unique path: targetId/timestamp-filename
    const path = `${targetId}/${Date.now()}-${file.name}`;
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    setUploadProgress(prev => {
      const next = { ...prev };
      delete next[file.name];
      return next;
    });

    if (error) {
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    } else {
      toast.success(`${file.name} uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["documents", targetId] });
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  };

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      if (!targetId) throw new Error("Not logged in");
      // Find the full path — files are listed by name, but stored under targetId/
      const { data: listing } = await supabase.storage.from(BUCKET).list(targetId);
      const match = listing?.find(f => f.name === fileName);
      if (!match) throw new Error("File not found");
      const { error } = await supabase.storage.from(BUCKET).remove([`${targetId}/${fileName}`]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents", targetId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const downloadFile = async (fileName: string) => {
    if (!targetId) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${targetId}/${fileName}`, 60);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const pendingUploads = Object.keys(uploadProgress);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        id="document-dropzone"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
          ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/30"}`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-medium text-sm">Click or drag & drop to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX — up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Uploading in progress */}
      {pendingUploads.map(name => (
        <div key={name} className="p-3 rounded-lg border bg-muted/30 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="truncate flex-1">{name}</span>
          </div>
          <Progress value={undefined} className="h-1" />
        </div>
      ))}

      {/* File list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 && pendingUploads.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {files.map((file) => (
            <div key={file.id ?? file.name} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <span className="text-xl shrink-0">{getFileIcon(file.metadata?.mimetype)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {/* Strip the timestamp prefix */}
                  {file.name.replace(/^\d+-/, "")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {file.metadata?.size ? formatBytes(file.metadata.size) : ""}
                  {file.created_at ? ` · ${new Date(file.created_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => downloadFile(file.name)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(file.name)}
                  title="Delete"
                >
                  {deleteMutation.isPending && deleteMutation.variables === file.name
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
