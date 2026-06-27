import {
  Check,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../../common/Reveal";
import StaggerContainer from "../../common/StaggerContainer";
import StaggerItem from "../../common/StaggerItem";

export default function PricingPlansSection() {

  const plans = [
    {
      title: "Starter Schools",
      description:
        "Perfect for schools beginning their digital assessment journey.",
      subtitle: "For small schools",
      features: [
        "AI Question Generation",
        "Online Exams",
        "Performance Reports",
        "Teacher Management"
      ]
    },

    {
      title: "Growing Institutions",
      description:
        "Built for institutions with expanding assessment requirements.",
      subtitle: "Most Popular",
      featured: true,
      features: [
        "Everything in Starter",
        "Advanced Analytics",
        "Leaderboards",
        "Multi-Teacher Support",
        "Priority Assistance"
      ]
    },

    {
      title: "Enterprise",
      description:
        "Tailored solutions for large schools and educational groups.",
      subtitle: "Custom Solutions",
      features: [
        "Everything in Growth",
        "Custom Integrations",
        "Dedicated Support",
        "Bulk Onboarding",
        "Custom Workflows"
      ]
    }
  ];

  return (
    <section className="py-12 bg-white">
      <Reveal>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}

        <div className="max-w-3xl mx-auto text-center">

          <div className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            mb-6">

            <Sparkles size={18} />

            Plans For Every Stage

          </div>

          <h2 className="
            text-4xl
            lg:text-5xl
            font-bold
            text-gray-900">

            Choose The Right Plan

          </h2>

          <p className="
            mt-6
            text-lg
            text-gray-600
            leading-relaxed">

            Whether you're starting with one school or managing
            multiple institutions, IndiaEduCore grows with you.

          </p>

        </div>


        {/* Pricing Cards */}
        <StaggerContainer>

        <div className="
          mt-20
          grid
          lg:grid-cols-3
          gap-8">

          {plans.map((plan) => (
            <StaggerItem key={plan.title}>

            <div
              
              className={`
                relative
                rounded-3xl
                border
                p-10
                bg-white
                shadow-sm
                hover:shadow-xl
                transition
                flex
                flex-col
                h-full
                ${
                  plan.featured
                    ? "border-blue-600 shadow-xl scale-[1.03]"
                    : ""
                }`}>

              {/* Popular Badge */}

              {plan.featured && (

                <div className="
                  absolute
                  top-0
                  left-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  bg-blue-600
                  text-white
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-medium">

                  Most Popular

                </div>

              )}

              <div className="text-sm text-blue-600 font-medium">

                {plan.subtitle}

              </div>

              <h3 className="
                mt-3
                text-3xl
                font-bold
                text-gray-900">

                {plan.title}

              </h3>

              <p className="
                mt-4
                text-gray-600
                leading-relaxed">

                {plan.description}

              </p>

              <div className="
                mt-8
                text-4xl
                font-bold
                text-gray-900">

                Custom

              </div>

              <div className="text-gray-500">

                Pricing based on requirements

              </div>

              {/* Features */}

              <div className="
                mt-10
                space-y-4
                flex-grow">

                {plan.features.map((feature) => (

                  <div
                    key={feature}
                    className="flex items-center gap-3">

                    <Check
                      size={18}
                      className="text-green-600 shrink-0"
                    />

                    <span className="text-gray-700">

                      {feature}

                    </span>

                  </div>

                ))}

              </div>

              <Link
                to="/demo"
                className={`
                  mt-10
                  inline-flex
                  justify-center
                  items-center
                  rounded-2xl
                  px-6
                  py-3
                  font-semibold
                  transition
                  ${
                    plan.featured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border hover:bg-gray-50"
                  }`}>

                Book Demo

              </Link>

            </div>
            </StaggerItem>

          ))}

        </div>
        </StaggerContainer>

      </div>
</Reveal>
    </section>
  );

}