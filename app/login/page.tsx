import AuthForm from "@/components/AuthForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efe3d3] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#d7c4aa] bg-[#f8f0e4] p-7 shadow-[0_16px_40px_rgba(96,71,49,0.12)] sm:p-9">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="積読コンシェルジュ"
            width={720}
            height={192}
            className="mx-auto h-16 w-auto"
            priority
          />
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
