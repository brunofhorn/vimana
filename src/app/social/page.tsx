import { Card, CardContent } from "@/components/card";
import { SocialNetworkTable } from "./SocialNetworkTable";
import { TitlePage } from "@/components/title-page";
import { SocialNetworkForm } from "./SocialNetworkForm";

export default function Social() {
    return (
        <div>
            <TitlePage title={"Redes Sociais"} />

            <Card>
                <CardContent className="mt-6">
                    <SocialNetworkForm />
                </CardContent>
            </Card>

            <div className="mt-6">
                <SocialNetworkTable />
            </div>
        </div>
    )
}