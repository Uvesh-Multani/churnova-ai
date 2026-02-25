import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-base">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "btn-primary h-10 w-full",
            card: "card bg-surface border-border",
            headerTitle: "font-syne text-2xl font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "btn-secondary h-10 border-border hover:border-primary text-primary transition-all",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground",
            formFieldLabel: "text-sm font-medium text-secondary-foreground",
            formFieldInput: "input h-10",
            footerActionLink: "text-primary hover:text-primary/80 transition-colors",
          }
        }}
      />
    </div>
  );
}
