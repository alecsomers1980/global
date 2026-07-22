export type PracticeArea = {
  slug: string;
  group: "wills-estates" | "property-law" | "litigation" | "law-of-contract" | "notary";
  title: string;
  intro: string;
  sections: { heading?: string; body: string }[];
};

export const PRACTICE_AREAS: PracticeArea[] = [
  // Wills & Estates
  {
    slug: "administration-of-deceased-estates",
    group: "wills-estates",
    title: "Administration of Deceased Estates",
    intro:
      "At the start of her career, before qualifying as an attorney, Berna Lubbe worked at the offices of the Master of the High Court for three years and later built a specialised Deceased Estates practice from the practical knowledge and expertise gained during these years.",
    sections: [
      {
        body: "This, coupled with our belief that winding up of Deceased Estates encompasses much more than the mere administration of documents together with our constant strive to make the process as stress-free as possible for the loved ones of the deceased, is why we believe you should use our services.",
      },
      {
        body: "At B Lubbe and Associates, we will set up, manage, and administer your Estate for you, leaving you comfortable in the knowledge that your Estate is in safe hands.",
      },
    ],
  },
  {
    slug: "drafting-of-wills",
    group: "wills-estates",
    title: "Drafting of Wills",
    intro:
      "We have been drafting Wills and administering Deceased Estates since 1985 and are able to draft a Will tailor-made to your specific circumstances. Because of our experience in winding up Estates, we know the effect of the wording of your Will.",
    sections: [
      {
        body: "When an employee of a bank or financial institution offers to assist you with your Will, consider the fact that leaving the drafting of your Will in the hands of someone without specialised knowledge and experience in the drafting of Wills and the administration of Estates, exposes your loved ones to an entire different set of potential pitfalls.",
      },
      {
        body: "Many a court case has originated from ambiguous wording in a Will or a clause written in such a way as to not be practically enforceable. This can result in family divisions, bitterness and a lack of closure for those you leave behind.",
      },
      {
        body: "We do not charge fees for the safekeeping of your Will in our safe and updating of your Will is done at a fraction of the fees.",
      },
    ],
  },
  {
    slug: "setting-up-trusts-appointment-of-trustees",
    group: "wills-estates",
    title: "Setting up Trusts / Appointment of Trustees",
    intro:
      "We draft your Trust Deed according to your specifications and attend to the registration of your Trust with the Master of the High Court. We often work in conjunction with your broker or financial advisor to ensure that the Trust can be used as a valuable Estate Planning tool.",
    sections: [
      {
        body: "It is important to understand that a Trust can be created in terms of your Will or in terms of a Trust Deed. If the Trust is created in terms of your Will, the Trust will only come into operation after your death, whereas an inter vivos Trust will come into operation as soon as it is registered at the Master of the High Court.",
      },
      {
        body: "The Trustees will be appointed and must take control of the Trust assets and manage these in terms of the Trust Deed. Whilst a Trust can be a very effective way of structuring your affairs, it is important that you and your family's financial and other circumstances must be taken into account when you create a Trust and you must make sure that you understand the legal implications of the Trust.",
      },
      {
        body: "Trustees must be aware of the legal fiduciary obligations that they will have in terms of the Trust Deed as well as the Trust Property Control Act 57 of 1988. We draft the Trust Deed for you and attend to the registration of the Trust Deed and Appointment of the Trustees at the Master of the High Court and can also assist your Trustees in opening of the Trust's bank account. Should circumstances necessitate an amendment to the Trust Deed, we can also assist in drafting and registering such a Deed of Amendment of Trust Deed.",
      },
    ],
  },
  {
    slug: "estate-planning",
    group: "wills-estates",
    title: "Estate Planning",
    intro: "Mere drafting of your Will does not constitute proper Estate Planning.",
    sections: [
      {
        body: "At B Lubbe & Associates, we shall work with your trusted accountant and/or broker to ensure that the outcome of the division of your Estate is in accordance with your wishes. During this planning process, we consult with you to ensure that all available options are considered and that the implementation of your Will is in the best interest of your heirs.",
      },
      {
        body: "We often use Testamentary Trusts as an option to safeguard your minor children's assets until they become majors or even at another age which you can choose. We carefully consider this and other aspects when discussing your Estate Planning.",
      },
    ],
  },
  {
    slug: "contingency-plans-for-smes",
    group: "wills-estates",
    title: "Contingency Plans for SME's",
    intro:
      "Many of our clients find themselves in a position where they have worked for many years, taken the risks and fought the headaches to build up a business which they can be proud of, but the problem is that often these businesses revolve around one key person with no contingency plans in place if the key person should be unable to fulfill his/her role.",
    sections: [
      {
        body: "Merely taking out a Key man policy as a contingency plan, is not always the solution if the key person should pass away, as winding up of the business is not always the best outcome for the client's family and staff who in many instances have also worked hard to attain the success of this business.",
      },
      {
        body: "To put contingency plans in place, we work with your broker, accountant and consult with your nominated key staff members to put contracts in place and align these with your Will to ensure that all the years of building up your business do not go to waste.",
      },
    ],
  },
  {
    slug: "estate-wills-related-litigation",
    group: "wills-estates",
    title: "Estate & Wills Related Litigation",
    intro:
      "We administer many Deceased Estates – often on behalf of other professionals who do not have a dedicated Deceased Estates Division like ours.",
    sections: [
      {
        body: "Sometimes litigation ensues where a Will or the administration of the Estate is contested by affected parties – even the heirs themselves, resulting in the necessity to bring a Court Application to resolve a dispute. Our litigation department is experienced in handling such problems as well as processing claims and assisting with objections against Executors of contentious Estates which are not administered by our firm.",
      },
      {
        body: "We aim to assist you in finding a speedy solution to these problems to protect you against future legal problems and if litigation should become necessary, we are equipped to assist you with Estate and Wills related litigation.",
      },
    ],
  },
  // Property Law
  {
    slug: "conveyancing",
    group: "property-law",
    title: "Conveyancing",
    intro:
      "Selling or Purchasing a property and conveyancing of the property can be daunting and even emotionally draining for clients.",
    sections: [
      {
        body: "Although there are many good estate agents in the market with whom we enjoy working hand in hand, clients are often disappointed with the effect of a Deed of Sale signed by them whilst not fully aware of its legal implications and resulting in a frustrating conveyancing process. This is why we encourage our clients and prospective clients to consult with us before signing the Deed of Sale, to ensure that the Deed of Sale will have the result that the client desires and the conveyancing of the property runs smoothly.",
      },
      {
        body: "We have been practicing as Conveyancing Attorneys since 1990 and strive to effect the conveyancing (transfer) of your property as quickly and efficiently as possible. During the conveyancing process, we build up a personal, yet professional relationship with our clients, the result being that we often find ourselves to be the preferred attorney for the entire family for their conveyancing and other property law related needs, always bearing in mind that our clients are the most important assets of our firm.",
      },
    ],
  },
  {
    slug: "property-transfer-cost-calculator",
    group: "property-law",
    title: "Property Transfer Cost Calculator",
    intro:
      "Calculate your approximate transfer costs, bond costs, and bond repayments before you buy or finance a property.",
    sections: [
      {
        body: "The costs of transferring ownership of property into your name comprise costs due to the government in the form of transfer duty, legal costs, as well as a number of payments the attorneys have to make to obtain clearances. There are also legal and administration costs in registering a bank loan to cover the balance of your purchase price, required upfront before registration can take place.",
      },
      {
        body: "Use our free Transfer Cost Calculator, Bond Cost Calculator, and Bond Repayment Calculator to get an approximate quotation. All values returned are estimates only and subject to change — contact us for a formal quotation on your specific transaction.",
      },
    ],
  },
  {
    slug: "contracts",
    group: "property-law",
    title: "Contracts",
    intro:
      "When you buy or sell an immovable property such as your house, apartment, business premises or vacant land, it is important to know that this agreement must be in writing and signed by the parties to be enforceable. Any changes to these Contracts must also be in writing and signed by the Seller and Purchaser/Buyer.",
    sections: [
      {
        body: "We draft these Deeds of Sale Contracts in accordance with both the Seller and Purchaser's needs whilst keeping within the ambit of the law and always taking into account the practical implications for the parties such as moving to or from a house or business. All relevant financial arrangements are also addressed in these Contracts, but most importantly, we make sure as far as possible, that the parties signing the agreement understand the content and effects thereof.",
      },
    ],
  },
  {
    slug: "lease-agreements",
    group: "property-law",
    title: "Lease Agreements",
    intro:
      "Although you are not (yet) required to have your Lease Agreements in writing, we strongly urge you to avoid misunderstandings resulting in disputes by letting us draft a Lease Agreement between you and your Landlord or tenant.",
    sections: [
      {
        body: "If you are the owner of a fixed property (house, flat, business premises) you need a properly drafted Lease Agreement to protect your interests, but you also need to ensure that the Lease Agreement is not unfair on your tenant.",
      },
      {
        body: "We can assist you with drafting your Lease Agreements, taking into account the Consumer Protection Act 68 of 2008 and other aspects relating to responsibilities and rights of the Owner (Landlord) and the tenant, and making sure that it is clear to all parties what is agreed on and leaving no room for misunderstandings. We also often act on behalf of our clients when they are the tenants and assist them in understanding their Lease Agreements before signing the agreement.",
      },
    ],
  },
  {
    slug: "sureties",
    group: "property-law",
    title: "Sureties",
    intro:
      "Sureties are persons who undertake to pay a sum of money or to perform a duty or promise for another person (natural or legal person) in the event that person fails to act, pay or perform his/its duties or obligations.",
    sections: [
      {
        body: "Many individuals do not conduct their businesses in their personal names, but rather in a Close Corporation, under a Trust or in a Company (known as Legal Personnae). Often when other parties contract with these Legal Personnae, they fear that the individuals will hide behind the company and Liquidate (close down) the Legal Personna to avoid due performance of their duties.",
      },
      {
        body: "It is for this reason that we draft Suretyships for our clients either to convince another person to contract with the Legal Personna by safeguarding the prospective client/customer or by requiring the other party to sign a Surety.",
      },
    ],
  },
  {
    slug: "power-of-attorney",
    group: "property-law",
    title: "Power of Attorney",
    intro:
      "Often when our clients have to sell property or take other actions, they find that they are not always available to sign documents, which implies that they need to afford somebody Power of Attorney.",
    sections: [
      {
        body: "We assist our clients by drafting a Power of Attorney tailor-made for the matter at hand so that the client (known as the Principal) appoints another person to act as his agent on his or her behalf, thereby conferring authority to the agent to perform certain acts or functions on behalf of the principal such as signing of a Deed of Sale, signing of Property Transfer registration documents and even Finance Agreements for the purchase or sale of a property.",
      },
      {
        body: "We draft such a Power of Attorney in accordance with the specific requirements of the Deeds Office thereby making a smooth property transaction possible even in the absence of one of the parties.",
      },
    ],
  },
  {
    slug: "property-dispute-litigation",
    group: "property-law",
    title: "Property Dispute Litigation",
    intro:
      "Our Conveyancing Department is often approached by our clients when a property dispute arises with their neighbours, and also when the property which they bought turns out not to be the palace promised or presented to them.",
    sections: [
      {
        body: "We have in the past successfully assisted our clients when a Body Corporate oversteps its rights or acts unfairly affecting our client's rights as property owner, and a property dispute arises.",
      },
      {
        body: "Our Litigation Department aims to find the most cost effective and speedy resolution to these property disputes by working in conjunction with our Conveyancing (Property) Department to identify and ascertain the extent of the infringement on your rights and estimate the damage or restitution to which you are entitled. We will assist you in claiming what is rightfully yours.",
      },
    ],
  },
  // Litigation
  {
    slug: "divorces",
    group: "litigation",
    title: "Divorces",
    intro:
      "When you are faced with the prospects of a divorce, it can be a very unsettling and emotionally challenging time for you. We guide and assist you through your divorce by offering the best solution for the dissolution of the marriage whilst protecting your interests.",
    sections: [
      {
        body: "We have a personal approach and believe in building a trust relationship with you, our client, at the same time keeping good communication to avoid unnecessary stress. We consider various options such as negotiation and mediation first to reach an amicable settlement outside of court. When circumstances are not conducive to an amicable settlement we have the ammunition to fight your battle for you in court.",
      },
      {
        body: "Although divorces happen between married couples, children inevitably are involved. This is why we also take the children's best interest into consideration when negotiating divorce settlement, drafting settlement agreements or fighting your battle in court. We also assist with divorce matters where one of the parties is based in South Africa and the other party in another country of origin.",
      },
      {
        heading: "Unopposed and opposed divorces",
        body: "An unopposed divorce occurs when there are no disputes and the parties can reach a settlement regarding issues such as the immovable property, other assets, access to the minor children and maintenance for the minor child and spouse, where relevant. This is a more cost effective and timeous procedure and can be finalised within three months.",
      },
      {
        body: "An opposed divorce occurs when there are many disputes and no consensus can be reached between the parties regarding the issues mentioned above. Summons will be served, interim access and maintenance can be ordered by the Court using the Rule 43 procedures and the divorce would then be heard before Divorce Court. To finalise this process can take up to two years and is a costly exercise.",
      },
      {
        body: "Due to the fact that we are qualified conveyancing attorneys with a strong property division, all property transfers resulting from the divorce are dealt with in-house. The divorce also makes it necessary to amend your will and here too you are in the best hands possible as B Lubbe & Associates Wills and Estates department was established in 1998 and offers a specialised and experienced service.",
      },
    ],
  },
  {
    slug: "property-disputes",
    group: "litigation",
    title: "Property Disputes",
    intro:
      "It can be said that a disagreement becomes a dispute when parties cannot agree on their differences. Even when a valid contract exists between parties, a difference in opinion regarding the interpretation of the contract can also lead to a dispute.",
    sections: [
      {
        body: "When you are involved in a dispute, a consultation with our Litigation Department will help you to assess whether litigation is the best option for you. If you approach us in the early stages of a disagreement, we aim to resolve the disagreement swiftly to avoid a dispute. In view of the costs involved in property litigation, we investigate the possibility of using other mechanisms to resolve the dispute, such as negotiation, arbitration and mediation, but if formal litigation remains the best option, we aim to conduct your case in a cost-effective way.",
      },
      {
        body: "We have in the past assisted our clients in claiming what is rightfully theirs in Contractual disputes, landlord and tenant disputes, sale and purchase disputes and various other disputes.",
      },
    ],
  },
  {
    slug: "evictions",
    group: "litigation",
    title: "Evictions",
    intro:
      "An eviction application becomes necessary if the lease agreement between owner and tenant has come to an end either in terms of the agreement or due to notice of cancellation.",
    sections: [
      {
        body: "If the tenant does not vacate the premises the owner will have to proceed with an eviction application. This is also the case when a person occupies premises without a lease agreement. This procedure is regulated by the PIE Act (Prevention of Illegal Evictions from and Unlawful Occupations Act 90 of 1998) with the result that it can be a complicated process for an owner to reclaim occupation of his property.",
      },
      {
        body: "We can advise you on the best approach to eliminate this burden by applying methods within the scope of this act to your advantage. In assessing your specific circumstances we help to decide whether the action in the High Court or Magistrate's Court will be to your best advantage.",
      },
    ],
  },
  {
    slug: "debt-collection",
    group: "litigation",
    title: "Debt Collection",
    intro:
      "The difficult economic conditions in South Africa and abroad has resulted in more and more debtors settling debts late or even not paying at all.",
    sections: [
      {
        body: "It is therefore important for us to assist our clients with quick and efficient recovery of outstanding debts with our debt collection experience. We also provide our clients with advice on suitable debt collection as well as credit agreements, acknowledgement of debts and other innovative agreements within the ambit of the law.",
      },
    ],
  },
  {
    slug: "consumer-protection-act",
    group: "litigation",
    title: "Consumer Protection Act",
    intro:
      "Most of our clients are aware of the existence of the Consumer Protection Act, but not everyone understands the effects thereof. When does this apply?",
    sections: [
      {
        body: "The short answer is: when you have been treated unfairly or even when you are accused of acting unfairly – good examples are unfairness in the execution of a contract, false advertising or when products are defective.",
      },
      {
        body: "As much as you may be a Service Provider, you are also a Consumer and your rights must be protected. We ensure that this is done when you enter into agreements, making purchases and generally conducting business. We want to protect your rights ensuring that reasonable terms and conditions are provided by you and to you in the process of concluding contracts.",
      },
    ],
  },
  {
    slug: "personal-injuries",
    group: "litigation",
    title: "Personal Injuries",
    intro:
      "You may have heard it before, but it is true that if it was not your fault, you should not have to carry the cost. It often happens that you incur a personal injury as a result of actions beyond your control and you may not wish to institute legal action for every injury, discomfort or loss that may occur.",
    sections: [
      {
        body: "However, when these personal injuries cause you to suffer financial loss or have long term physical or emotional effects, we can assist you in recovering damages from the guilty party. Typical examples are: going for a run and being bitten by a dog when its owner does not control the dog, slipping on a wet floor in a public building, or being caught in the malfunctioning revolving door of a shopping center.",
      },
      {
        body: "Personal injuries as a result of slipping and falling, are often referred to as \"Slip and Trip\" injuries, and compensation can be claimed from the owners of businesses or properties because they are required by law to keep their premises in a reasonably safe condition to prevent harm to the general public. If premises are not safe, the owners are required to warn the public of potential danger and failing to do so, will open the owner up to liability for injuries suffered.",
      },
      {
        heading: "Medical Malpractice",
        body: "One of the most prevalent forms of personal injury results from the incorrect or inappropriate medical treatment or procedure, or lack thereof, by a medical professional. This includes doctors, specialists, nurses, dentists, physiotherapists, osteopaths, and health care facilities such as nursing homes. The damages that you may have suffered can be in the form of medical costs and expenses, costs incurred to improve your life after such an event, loss of income, and pain and suffering.",
      },
    ],
  },
  {
    slug: "high-court-applications",
    group: "litigation",
    title: "High Court Applications",
    intro:
      "It is often necessary to approach the High Court to obtain an order to attain certain results such as Sequestrations, Liquidations, placing a person under Curatorship, Eviction of unlawful occupants, Interdicts, change of Marital Regime, Enforcing of parental rights, and various other matters.",
    sections: [
      {
        body: "We assist our clients in bringing these applications to the High Court. The procedure is sometimes referred to as \"motion\" proceedings and is based on Affidavits with supporting documents. The Court may, however, in certain circumstances refer the matter for argument if it cannot make a decision based on the documents before it.",
      },
      {
        body: "Sequestrations and Liquidations can be voluntary or forced on an individual (Sequestration) or Company (Liquidation) by his/its creditors. Should you find yourself or your Company in an insurmountable financial position, it is often in your best interest to Sequestrate or have the Company liquidated voluntarily, despite the fact that as an individual you will be insolvent for at least two years and will have to apply to Court if you want to be rehabilitated within ten years after Sequestration.",
      },
      {
        body: "We are often approached by concerned family members of people lacking mental capacity to make decisions on their own regarding their personal and financial welfare and affairs — for example a person who is mentally disabled or suffers from illnesses related to old age such as Alzheimer's disease. In these circumstances we can assist with bringing a High Court Application to place the person under Curatorship. For minor children without parents capable of making decisions on their behalf, we can apply to the Court to have a Curator appointed for them.",
      },
    ],
  },
  // Law of Contract
  {
    slug: "antenuptial-contracts",
    group: "law-of-contract",
    title: "Antenuptial (PreNup) Contracts",
    intro:
      "Is choosing your legal Marital Status at the top of your wedding checklist? Your Antenuptial Contract is possibly one of the most important legal contracts you will sign in your life.",
    sections: [
      {
        body: "It is therefore important to ensure that you have sufficient information to make a well informed decision on the marital regime you wish to apply to your marriage. Make sure to make the appointment with us well in advance of your Big Day. When you decide to start the Antenuptial Contract process, contact us either by phone or email. We shall supply you with a form to complete and return in order to speed the process up and make it as convenient as possible for you.",
      },
      {
        body: "Antenuptial Contracts must be executed by a Notary. Berna Lubbe is a qualified Notary, and can therefore be at the meeting when you sign the Antenuptial Contract and hand you the Document which your Marriage Officer requires.",
      },
      {
        body: "We find that couples about to get married usually require a new Will too, but do not want to incur additional expenses. We now offer a free Will if signed together with the Antenuptial Contract.",
      },
    ],
  },
  {
    slug: "service-level-agreements",
    group: "law-of-contract",
    title: "Service Level Agreements",
    intro:
      "In the past one could still settle agreements on a hand shake. Unfortunately times have changed and our clients need our protection in business transactions.",
    sections: [
      {
        body: "One of the ways that we can protect our clients is by drafting a proper Service Level Agreement which clarifies expectations and parameters in your dealings with clients or customers. A Service Level Agreement is an important tool in your business to ensure that both you and your client and/or customer knows what is expected in terms of your business relationship, and can therefore reduce conflict and resolve disputes should same arise.",
      },
      {
        body: "Service Level Agreements cannot be generic because the content depends on what the actual service consists of — we therefore consult with the client to identify the key services and implement same in the contract. As your working relationship with your client or customer develops, service levels may change and we shall amend your Service Level Agreement from time to time when you notify us of changes.",
      },
    ],
  },
  {
    slug: "cohabitation-agreements",
    group: "law-of-contract",
    title: "Cohabitation Agreements",
    intro:
      "A Cohabitation Agreement is an agreement between a couple who wish to live together but do not want to enter into a marriage, although they want to protect themselves from litigation and other negative consequences should their Cohabitation break down.",
    sections: [
      {
        body: "Many couples move in together long before marriage is considered. This is a very exciting time and couples generally do not consider what will happen if living together does not work out. It is ideal that a couple sign a Cohabitation Agreement when they first move in together, but if you have not done so this agreement remains a good idea and can be done at a later stage in the relationship.",
      },
      {
        body: "In this agreement the couple can stipulate who pays for what and who carries which responsibilities of the joint household, and what the arrangements will be if they separate — specifying who will keep specific assets and what will happen to assets bought jointly.",
      },
      {
        body: "Although living together is attractive, couples must remember that this relationship is not recognised as such in South African law, and you do not have the same rights as married couples. While you could try to prove your rights in terms of a Universal Partnership, it does not mean that you will be successful, and this is a very expensive process as it entails a High Court Application. We therefore advise that you contact us to draft a Cohabitation Agreement for you.",
      },
    ],
  },
  {
    slug: "partnership-agreements",
    group: "law-of-contract",
    title: "Partnership Agreements",
    intro:
      "According to South African law, partnerships are not regarded as legal persons such as, for example, a Company. Therefore no specific codes of conduct is prescribed or regulated by law for partnerships, and the partners have to agree amongst themselves what their relationship will entail.",
    sections: [
      {
        body: "Some partners may be silent partners (someone who contributes financially but is not involved in the management of the partnership, although their name is made public), anonymous partners (financially involved but not in management, and not publicly named), or limited partners (contributes financially but is only liable for partnership expenses to the extent of their financial contributions). All these partners receive profits from the partnership to a certain extent, which share must be agreed upon amongst the partners.",
      },
      {
        body: "The Partnership Agreement does not have to be in writing, but it is clearly in the best interest of the partners and other people or institutions dealing with the partnership that arrangements should be stipulated in a written document.",
      },
      {
        body: "Standard aspects which we consider in drafting the partnership are: the nature of the business activities; the address from where business will be conducted; the formation date as well as the estimated duration of the partnership; the contributions of each partner; arrangements regarding how profits and losses will be appropriated; arrangements regarding drawings by partners as well as interest charged on these amounts; whether partners earn interest on capital and at what rate; whether partners working in the partnership earn salaries or drawings; procedures regarding disputes; and termination of partnership procedures.",
      },
    ],
  },
  // Notary
  {
    slug: "notary",
    group: "notary",
    title: "Notary",
    intro:
      "In South Africa, not all Attorneys are Notaries. To practice as a Notary, an Attorney must pass an additional examination and be admitted by the High Court as a Notary, whereafter he/she may practice in certain areas of the law such as Authentication of documents, Marriage Contracts and certain aspects of Property Law (Conveyancing).",
    sections: [
      {
        body: "Berna Lubbe and Francis Thompson are such qualified Notaries and can assist in the drafting of Notarial Agreements, Antenuptial Contracts (Prenups), Civil Union Contracts, Cohabitation Agreements, Notarial Servitudes and Notarial Bonds, and other agreements, as well as Authentication of documents required by institutions abroad who generally no longer accept certification by Commissioner of Oaths.",
      },
      {
        body: "Antenuptial (Prenup) agreements must be signed in front of a Notary Public prior to registration of the Antenuptial Contract in the Deeds Office. The signed contract must be signed before the Notary before the intended marriage is concluded and must be registered at the Deeds Office within three months from the date of signature.",
      },
      {
        body: "As Notaries, we are authorised to authenticate documents or signatures on documents for the use of the documents in countries outside South Africa. Often the Notary's signature must further be confirmed by the High Court by endorsing the documentation with an Apostille. The authority of Notaries in South Africa is recognised and accepted world wide.",
      },
    ],
  },
];

export function getPracticeArea(group: PracticeArea["group"], slug: string) {
  return PRACTICE_AREAS.find((p) => p.group === group && p.slug === slug);
}
