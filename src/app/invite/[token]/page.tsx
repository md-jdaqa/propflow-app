// Server component wrapper — enables static export for dynamic [token] route
import InvitePageContent from "./InvitePageContent";

// Static export: generate a few stub tokens; real token data is resolved client-side
export async function generateStaticParams() {
  return [{ token: "demo" }, { token: "sample" }, { token: "preview" }];
}

export default function InvitePage() {
  return <InvitePageContent />;
}
