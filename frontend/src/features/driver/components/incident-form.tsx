import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, MapPin, Upload, X } from "lucide-react";
import { documentsApi } from "@/lib/api/incidents";
import type { IssueCategory } from "@/lib/types";

export interface IncidentDraft {
  issueCategory: IssueCategory;
  description: string;
  latitude: number;
  longitude: number;
  attachmentUrls: string[];
}

interface IncidentFormProps {
  onSubmit: (draft: IncidentDraft) => void | Promise<void>;
  submitting?: boolean;
}

const CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: "STARTING_ISSUE", label: "Starting issue" },
  { value: "BATTERY_ISSUE", label: "Battery issue" },
  { value: "CHARGING_ISSUE", label: "Charging issue" },
  { value: "TIRE_ISSUE", label: "Tire issue" },
  { value: "SOFTWARE_GLITCH", label: "Software glitch" },
  { value: "UNKNOWN", label: "Other / not sure" },
];

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

export function IncidentForm({ onSubmit, submitting }: IncidentFormProps) {
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Object-URL cleanup for previews.
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message || "Couldn't get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected) return;
    setUploadError(null);
    const accepted: File[] = [];
    const rejected: string[] = [];
    Array.from(selected).forEach((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        rejected.push(`${f.name}: unsupported type`);
        return;
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${f.name}: exceeds ${MAX_FILE_SIZE_MB} MB`);
        return;
      }
      accepted.push(f);
    });
    if (rejected.length) setUploadError(rejected.join("; "));
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const uploadAll = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploading(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const result = await documentsApi.upload(f, "OTHER");
        urls.push(result.fileUrl);
      }
      setUploadedUrls(urls);
      return urls;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setUploadError(msg);
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!category) return setFormError("Pick an issue category.");
    if (description.trim().length < 10) {
      return setFormError("Please describe the issue (at least 10 characters).");
    }
    if (!coords) return setFormError("Capture your current location first.");

    let urls = uploadedUrls;
    if (files.length > 0 && uploadedUrls.length === 0) {
      try {
        urls = await uploadAll();
      } catch {
        return;
      }
    }

    await onSubmit({
      issueCategory: category as IssueCategory,
      description: description.trim(),
      latitude: coords.lat,
      longitude: coords.lng,
      attachmentUrls: urls,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an incident</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="category">Issue category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as IssueCategory)}
            disabled={submitting}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">What's going on?</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue. Include sounds, lights, error messages, anything unusual."
            rows={4}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={captureLocation}
              disabled={locating || submitting}
            >
              {locating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              {coords ? "Update location" : "Capture current location"}
            </Button>
            {coords && (
              <span className="text-sm text-muted-foreground">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            )}
          </div>
          {locationError && (
            <p className="text-sm text-destructive">{locationError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="files">Evidence (optional)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("files")?.click()}
              disabled={uploading || submitting}
            >
              <Upload className="mr-2 h-4 w-4" />
              Add photo or video
            </Button>
            <input
              id="files"
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <span className="text-xs text-muted-foreground">
              Up to {MAX_FILE_SIZE_MB} MB each — JPG, PNG, WebP, MP4
            </span>
          </div>
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          {files.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="relative rounded border p-2">
                  {f.type.startsWith("image/") && previewUrls[i] ? (
                    <img
                      src={previewUrls[i]}
                      alt={f.name}
                      className="h-24 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded bg-muted text-xs">
                      {f.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded bg-background/80 p-1"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {formError}
          </div>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="w-full"
        >
          {submitting || uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {uploading ? "Uploading evidence..." : submitting ? "Submitting..." : "Submit incident"}
        </Button>
      </CardContent>
    </Card>
  );
}