import SectionTitle from "../../common/section-title";
import featuresData from "./feature-data";
import SingleFeature from "./single-feature";


const Features = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="w-full max-w-11/12 mx-auto">
          <SectionTitle
            title="Election Management System"
            paragraph="Our platform provides end-to-end tools for organizing transparent, efficient elections"
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-2">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
