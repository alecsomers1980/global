import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function main() {
    await pb.admins.authWithPassword(process.env.POCKETBASE_SUPERADMIN_EMAIL, process.env.POCKETBASE_SUPERADMIN_PASSWORD);

    const record1 = await pb.collection('enquiries').create({
        type: 'buy_spot',
        status: 'new',
        business_name: 'Thulamahashe Fresh Produce',
        contact_person: 'Tebogo Mokoena',
        phone: '082 345 6789',
        email: 'tebogo@thulamafresh.co.za',
        details: '<p>We are a local vegetable stall looking to list on the directory to reach more customers in Thulamahashe. We offer daily fresh produce at affordable prices.</p>',
    });
    console.log(`Successfully created: ${record1.business_name}`);

    const record2 = await pb.collection('enquiries').create({
        type: 'buy_spot',
        status: 'contacted',
        business_name: 'Acornhoek Build It',
        contact_person: 'Sipho Ndlovu',
        phone: '013 795 1234',
        email: 'sipho@acornhoekbuildit.co.za',
        details: '<p>We would like to advertise our hardware store on the site. We serve Acornhoek and surrounding villages with building materials and tools.</p>',
    });
    console.log(`Successfully created: ${record2.business_name}`);

    const record3 = await pb.collection('enquiries').create({
        type: 'general',
        status: 'new',
        business_name: 'Dwarsloop Community Forum',
        contact_person: 'Nomvula Khumalo',
        phone: '083 456 7890',
        email: 'nomvula.k@dwarsloop.org.za',
        details: '<p>I want to ask if the platform will add a section for local events in Dwarsloop. Our community needs better coordination of cultural gatherings.</p>',
    });
    console.log(`Successfully created: ${record3.business_name}`);

    const record4 = await pb.collection('enquiries').create({
        type: 'general',
        status: 'resolved',
        business_name: 'Mkhuhlu Ratepayers Association',
        contact_person: 'Thandiwe Sibiya',
        phone: '013 737 5678',
        email: 'thandiwe.s@mkhuhlurpa.co.za',
        details: '<p>We have a question about listing municipal services on the directory. We were told to use the general enquiry form to get in touch.</p>',
    });
    console.log(`Successfully created: ${record4.business_name}`);

    const record5 = await pb.collection('enquiries').create({
        type: 'employer_services',
        status: 'contacted',
        business_name: 'Dwarsloop Spar Supermarket',
        contact_person: 'Lindiwe Mathebula',
        phone: '082 987 6543',
        email: 'lindiwe@dwarsloopspar.co.za',
        details: '<p>We are looking to hire 2 cashiers and 1 shelf packer. Please assist with posting the job advert on your platform.</p>',
    });
    console.log(`Successfully created: ${record5.business_name}`);

    const record6 = await pb.collection('enquiries').create({
        type: 'employer_services',
        status: 'approved',
        business_name: 'Thulamahashe Clinic Pharmacy',
        contact_person: 'Bongani Chauke',
        phone: '013 792 2345',
        email: 'bongani@thulamaclinicpharm.co.za',
        details: '<p>We would like to post a vacancy for a pharmacist assistant (1 position) and a cleaner (2 positions). The listing must include our contact details.</p>',
    });
    console.log(`Successfully created: ${record6.business_name}`);
}

main().catch((e) => console.error('ERR', e.message, JSON.stringify(e.data || {})));
