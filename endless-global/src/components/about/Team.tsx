import { team } from "@/lib/content";

interface TeamMember {
  photo: string;
  name: string;
  role: string;
}

export default function Team() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="eg-container">
        <div className="text-center">
          <span className="eyebrow">Meet The Team</span>
          <h2 className="section-title mt-4">Our Leadership</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {team.map((member: TeamMember) => (
            <div key={member.name} className="text-center">
              <div className="overflow-hidden rounded-xl bg-section">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full aspect-[3/4] object-cover object-top"
                />
              </div>
              <h3 className="mt-4 font-semibold text-brand">{member.name}</h3>
              <p className="text-sm text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
