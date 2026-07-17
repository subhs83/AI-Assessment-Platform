import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingDots from "./LoadingDots";
import ImageWithFallback from "../common/ImageWithFallback";
import { useSchoolStore } from "../store/schoolStore";

export default function SchoolLoading({
    name = "School",
    logo,
    message = "Preparing your exam...",
}) {

    const { schoolSlug } = useParams();
    const fetchSchoolBrand = useSchoolStore(
        (s) => s.fetchSchoolBrand
      );

    useEffect(() => {
        if (schoolSlug) {
        fetchSchoolBrand(schoolSlug);
        }
    }, [schoolSlug, fetchSchoolBrand]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm text-center">

                <ImageWithFallback
                    src={logo}
                    alt={name}
                    className="mx-auto h-20 w-20 rounded-2xl"
                    iconClassName="h-10 w-10"
                />

                <h1 className="mt-6 text-xl font-semibold text-foreground">
                    {name}
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    {message}
                </p>

                <div className="mt-8">
                    <LoadingDots />
                </div>

                <p className="mt-10 text-xs text-muted-foreground">
                    Powered by{" "}
                    <span className="font-medium text-foreground">
                        IndiaEduCore
                    </span>
                </p>

            </div>
        </div>
    );
}