import { Card, CardContent } from "@/components/card";
import { SocialNetworkTable } from "./SocialNetworkTable";
import { TitlePage } from "@/components/title-page";
import { SocialNetworkForm } from "./SocialNetworkForm";

export default function Social() {
    return (
        <div>
            <TitlePage title={"Redes Sociais"} />

            <Card className="bg-white/5 border-white/5">
                <CardContent className="mt-6">
                    <SocialNetworkForm />
                </CardContent>
            </Card>

            <Card className="mt-6 bg-white/5 border-white/5">
                <CardContent className="mt-6">
                    <SocialNetworkTable />
                </CardContent>
            </Card>
        </div>
    )
}
