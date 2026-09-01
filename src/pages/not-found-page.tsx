import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That route is not part of the operator console.
      </p>
      <Button asChild className="mt-4">
        <Link to="/projects">Projects</Link>
      </Button>
    </div>
  );
}
