import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="glass p-6">
      <h1 className="text-xl font-bold mb-4">New client</h1>
      <NewClientForm />
    </div>
  );
}
