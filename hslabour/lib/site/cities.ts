export type City = {
  slug: string;
  name: string;
  province: string;
  blurb: string;
};

export const cities: City[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    blurb:
      "H&S Labour Brokers serves employers across Johannesburg, providing skilled temporary and permanent staff throughout the Gauteng economic hub.",
  },
  {
    slug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    blurb:
      "From our network in Pretoria, H&S Labour Brokers supplies reliable TES, payroll and recruitment services to businesses in Gauteng’s administrative capital.",
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    blurb:
      "H&S Labour Brokers supports Cape Town employers with compliant workforce solutions across the Western Cape, from the CBD to outlying areas.",
  },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    blurb:
      "Serving Durban and KwaZulu-Natal, H&S Labour Brokers delivers temporary employment, recruitment, and payroll services that meet the region’s industrial and commercial needs.",
  },
  {
    slug: "gqeberha",
    name: "Gqeberha",
    province: "Eastern Cape",
    blurb:
      "H&S Labour Brokers partners with Gqeberha employers to provide vetted temporary and permanent staff across the Eastern Cape, from manufacturing to services.",
  },
  {
    slug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    blurb:
      "H&S Labour Brokers offers TES, recruitment, and HR services to Bloemfontein businesses, helping them build reliable workforces across the Free State.",
  },
];

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}