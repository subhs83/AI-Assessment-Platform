import {
ShieldCheck,
Brain,
BarChart3,
Building2,
Users
} from "lucide-react";
import Reveal from "../common/Reveal";


const indicators = [
{
icon: Brain,
title: "AI-Assisted",
},
{
icon: ShieldCheck,
title: "Secure Platform",
},
{
icon: BarChart3,
title: "Analytics Driven",
},
{
icon: Building2,
title: "Multi-School Ready",
},
{
icon: Users,
title: "Role-Based Access",
},
];

export default function TrustIndicatorsSection() {
return ( <section className="border-y bg-white">
  <Reveal>

  <div className="max-w-7xl mx-auto px-6 py-6">

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

      {indicators.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              group
              flex
              items-center
              justify-center
              gap-3
              text-center
            "
          >
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-blue-50
                flex
                items-center
                justify-center
                hover:shadow-xl
                transition-all
                duration-300
              "
            >
              <Icon
                size={20}
                className="text-blue-600"
              />
            </div>

            <span
              className="
                font-medium
                text-gray-700
              "
            >
              {item.title}
            </span>
          </div>
        );
      })}
    </div>

  </div>
</Reveal>
</section>
 
);
}
