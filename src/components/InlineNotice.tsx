"use client";

interface InlineNoticeProps {
  tone: "error" | "success";
  message: string;
}

export default function InlineNotice({
  tone,
  message,
}: InlineNoticeProps) {
  return (
    <div className={`alert ${tone === "error" ? "alert-error" : "alert-success"}`}>
      <span>{message}</span>
    </div>
  );
}
