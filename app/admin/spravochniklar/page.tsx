import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import {
  fanlarniOl,
  sinflarniOl,
  mavzularniOl,
  fanQoshish,
  fanTahrirlash,
  fanOchirish,
  sinfQoshish,
  sinfTahrirlash,
  sinfOchirish,
  mavzuQoshish,
  mavzuOchirish,
} from "@/lib/actions/spravochniklar";
import { NomliRoyxat } from "@/components/admin/nomli-royxat";
import { MavzularRoyxat } from "@/components/admin/mavzular-royxat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SpravochniklarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
  ]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Fan, sinf va mavzular</h1>

      <Tabs defaultValue="fanlar">
        <TabsList>
          <TabsTrigger value="fanlar">Fanlar</TabsTrigger>
          <TabsTrigger value="sinflar">Sinflar</TabsTrigger>
          <TabsTrigger value="mavzular">Mavzular</TabsTrigger>
        </TabsList>

        <TabsContent value="fanlar" className="pt-4">
          <NomliRoyxat
            sarlavha="Fan nomi"
            qoshishYorligi="Yangi fan nomi"
            royxat={fanlar}
            qoshish={fanQoshish}
            tahrirlash={fanTahrirlash}
            ochirish={fanOchirish}
          />
        </TabsContent>

        <TabsContent value="sinflar" className="pt-4">
          <NomliRoyxat
            sarlavha="Sinf nomi"
            qoshishYorligi="Masalan: 5-B"
            royxat={sinflar}
            qoshish={sinfQoshish}
            tahrirlash={sinfTahrirlash}
            ochirish={sinfOchirish}
          />
        </TabsContent>

        <TabsContent value="mavzular" className="pt-4">
          <MavzularRoyxat
            mavzular={mavzular}
            fanlar={fanlar}
            sinflar={sinflar}
            qoshish={mavzuQoshish}
            ochirish={mavzuOchirish}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
