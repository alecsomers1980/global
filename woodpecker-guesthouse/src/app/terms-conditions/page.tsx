import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-6">Terms &amp; Conditions</h1>
      <div className="article-body">
        <h2>1. Reservations, Payment and Terms</h2>
        <p>
          1.1. Reservations are accepted on a &lsquo;per room&rsquo; basis and not &lsquo;per person&rsquo;. Rates
          are therefore subject to the type of room occupied. The names and relationship to the Guest of the
          additional people sharing the room must be provided when the reservation is made. Children over 1 are
          welcome. Children aged 14 and above are considered adults.
        </p>
        <p>
          1.2. Bookings can only be confirmed if the guesthouse receives a full deposit on accommodation, or valid
          credit card details with authorization to debit, along with the Guest name, surname, number of persons
          sharing each room, cell phone number of the Guest, confirmed payment method and expected time of arrival
          of each Guest.
        </p>
        <p>
          <strong>Cancellation policy:</strong>
        </p>
        <p>
          1.3. If you cancel after reservation, the cancellation fee will be 50% of the total price.
          <br />
          1.4. 50% of deposit will be paid back if cancellation is made 30 days before arrival.
          <br />
          1.5. The full deposit will be forfeited if the confirmed reservation is cancelled within 14 days of
          arrival.
          <br />
          1.6. Discounted rates will be revised should the duration of stay be decreased or postponed, or payment
          terms not be adhered to.
          <br />
          1.7. The Guest retains personal liability for the bill until the employer, agent, or person that made the
          reservation on his or her behalf has settled the account.
          <br />
          1.8. Cash, internet transfers and all major credit cards are valid payment methods. Cheques are not
          accepted.
          <br />
          1.9. Refunds will only be made after payment has been finally cleared by the bank or Credit Card Company.
          This process can take up to 30 days.
        </p>

        <h2>2. Check-In and Check-Out</h2>
        <p>
          2.1. Check-in time is between 13:00 and 18:00 unless prior arrangements have been made. No check-in will
          be made after 18:00, unless arranged with management. This is necessary for security assurance, comfort
          and well-being of other guests.
        </p>
        <p>
          2.2. Check-out time is between 08:00 and 11:00 unless prior arrangements have been made. No check-out
          after 11:00. This is to enable the room to be prepared in time for new arrivals. Guests that check out
          after 11:00 without prior arrangement will be liable for an extra night&apos;s accommodation, as we will
          not be able to service the room in time for new arrivals.
        </p>
        <p>2.3. At check-in, the guest must present the credit card used to make the online booking.</p>

        <h2>3. Service Hours</h2>
        <p>
          3.1. The reception desk is open from 07:00 to 17:00 Monday to Fridays and 08:00 to 10:00 on weekends and
          public holidays.
        </p>
        <p>
          3.2. Subject to availability of rooms, persons interested in booking accommodation and wishing to view the
          guesthouse beforehand may do so, provided a room is vacant.
        </p>

        <h2>4. Security &amp; Storage</h2>
        <p>
          4.1. The guesthouse takes reasonable steps to ensure the safety and security of Guests and their
          possessions, however, guests hold final responsibility for their own safety and security. Ensure rooms
          are locked at all times and place valuables in the safe provided. Upon check-out please leave the safe
          open and room locked.
        </p>
        <p>4.2. The guesthouse does not provide storage facilities for personal belongings or vehicles.</p>

        <h2>5. Loss or Damage to Guest House Property</h2>
        <p>The Guest holds personal liability for any loss or damages caused to the property.</p>

        <h2>6. General Incapacity</h2>
        <p>
          The guesthouse cannot be held liable if any of the following events or conditions prevents the guesthouse
          from fulfilling its obligation to Guests. Under such unforeseen conditions, the guesthouse will take all
          reasonable steps to minimize disruption and discomfort to Guests.
        </p>
        <p>
          6.1. Unanticipated interruption to the electricity, water, or sewage from or on the guesthouse property.
          <br />
          6.2. Industrial action, civil uprising or criminal activity.
          <br />
          6.3. Fire, frost, flooding, or any natural disasters.
        </p>
      </div>
    </main>
  );
}
