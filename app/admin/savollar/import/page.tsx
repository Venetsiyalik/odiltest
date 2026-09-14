import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { ImportExcelClient } from "@/components/admin/import-excel-client";
import { ImportHujjatClient } from "@/components/admin/import-hujjat-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SavollarImportPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
  ]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Savollarni import qilish</h1>

      <Tabs defaultValue="excel">
        <TabsList>
          <TabsTrigger value="excel">Excel / CSV</TabsTrigger>
          <TabsTrigger value="word">Word (.docx)</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="excel" className="pt-4">
          <ImportExcelClient />
        </TabsContent>

        <TabsContent value="word" className="pt-4">
          <ImportHujjatClient turi="word" fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} />
        </TabsContent>

        <TabsContent value="pdf" className="pt-4">
          <ImportHujjatClient turi="pdf" fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
