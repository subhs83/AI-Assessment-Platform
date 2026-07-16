import logo from "../../assets/images/indiaeducore-logo.png";
import LoadingDots from "./LoadingDots";

export default function BrandLoading({
    message = "Loading...",
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm text-center">

                <img
                    src={logo}
                    alt="IndiaEduCore"
                    className="mx-auto h-20 w-20 object-contain"
                />

                <h1 className="mt-6 text-2xl font-bold text-foreground">
                    IndiaEduCore
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    {message}
                </p>

                <div className="mt-8">
                    <LoadingDots />
                </div>

            </div>
        </div>
    );
}