import logo from "../../assets/branding/logo-splash.png";
import LoadingDots from "./LoadingDots";

export default function BrandLoading({
message = "Loading...",
}) {
return ( <div
         className="
             fixed
             inset-0
             z-[9999]
             flex
             items-center
             justify-center
             bg-background
             px-6
         "
     > <div className="w-full max-w-sm text-center">
            <img
                src={logo}
                alt="IndiaEduCore"
                className="mx-auto h-20 w-auto object-contain"
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
