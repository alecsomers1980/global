/**
 * jobcard-pdf.tsx — @react-pdf/renderer document for the Aloe Signs printable
 * jobcard. Production-floor document: customer/job info + the item list +
 * department specs for whichever departments are ticked. No pricing.
 *
 * Pure component: data in → Document out. No data fetching, no side effects.
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const ALOE_GREEN = '#00E533';
const CHARCOAL = '#1A1A1A';
const MEDIUM_GREY = '#666666';
const BORDER_GREY = '#E0E0E0';
const BG_GREY = '#F7F7F7';

const styles = StyleSheet.create({
    page: {
        paddingTop: 32,
        paddingBottom: 36,
        paddingHorizontal: 36,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: CHARCOAL,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottom: `2 solid ${ALOE_GREEN}`,
        marginBottom: 14,
    },
    logo: { width: 110, height: 'auto' },
    headerRight: { alignItems: 'flex-end' },
    docTitle: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: CHARCOAL,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    docSub: { fontSize: 8, color: MEDIUM_GREY, marginTop: 3 },

    infoRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    infoBox: {
        flex: 1,
        border: `1 solid ${BORDER_GREY}`,
        borderRadius: 4,
    },
    infoBoxHeader: {
        backgroundColor: BG_GREY,
        borderBottom: `1 solid ${BORDER_GREY}`,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    infoBoxTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: MEDIUM_GREY,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoBoxBody: { padding: 8, gap: 3 },

    fieldRow: { flexDirection: 'row', gap: 4 },
    fieldLabel: { fontFamily: 'Helvetica-Bold', color: MEDIUM_GREY, width: 60 },
    fieldValue: { flex: 1, color: CHARCOAL },

    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: CHARCOAL,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 4,
    },

    table: { border: `1 solid ${BORDER_GREY}`, borderRadius: 4, marginBottom: 14 },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: CHARCOAL,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    tableHeaderCell: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderTop: `1 solid ${BORDER_GREY}`,
    },
    tableCell: { fontSize: 9, color: CHARCOAL },
    colQty: { width: 34 },
    colSize: { width: 70 },
    colItem: { width: 90, fontFamily: 'Helvetica-Bold' },
    colDesc: { flex: 1, color: MEDIUM_GREY },

    noteBox: {
        border: `1 solid ${BORDER_GREY}`,
        borderRadius: 4,
        backgroundColor: BG_GREY,
        padding: 8,
        marginBottom: 14,
    },
    noteText: { fontSize: 9, color: CHARCOAL, lineHeight: 1.4 },

    deptCard: {
        border: `1 solid ${BORDER_GREY}`,
        borderRadius: 4,
        marginBottom: 10,
    },
    deptHeader: {
        backgroundColor: ALOE_GREEN,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    deptHeaderText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: CHARCOAL,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    deptBody: { padding: 8, gap: 3 },

    footer: {
        position: 'absolute',
        bottom: 16,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: MEDIUM_GREY,
        borderTop: `1 solid ${BORDER_GREY}`,
        paddingTop: 6,
    },
});

const Field = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{String(value)}</Text>
        </View>
    );
};

const DeptCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.deptCard} wrap={false}>
        <View style={styles.deptHeader}>
            <Text style={styles.deptHeaderText}>{title}</Text>
        </View>
        <View style={styles.deptBody}>{children}</View>
    </View>
);

const INSTALL_TOOL_LABELS: Record<string, string> = {
    basic: 'Basic', applicate: 'Applicate', electrical: 'Electrical', special: 'Special',
    set_build: 'Set Build', generator: 'Generator', compressor: 'Compressor',
    ladders: 'Ladders', scaffold: 'Scaffold', cherry_picker: 'Cherry Picker',
};

export default function JobcardPdf({ jobcard, logo }: { jobcard: any; logo: string }) {
    const items = Array.isArray(jobcard.items_json) ? jobcard.items_json : [];
    const materials = Array.isArray(jobcard.materials_json)
        ? jobcard.materials_json.filter((m: string) => m !== 'Other' && m !== 'OTHER')
        : [];
    if (jobcard.materials_other_text) materials.push(jobcard.materials_other_text);

    const deliverVehicles = [
        jobcard.deliver_car && 'Car', jobcard.deliver_bakkie && 'Bakkie', jobcard.deliver_truck && 'Truck',
        jobcard.deliver_trailer && 'Trailer', jobcard.deliver_courier && 'Courier',
    ].filter(Boolean).join(', ');

    const installVehicles = [
        jobcard.install_bakkie && 'Bakkie', jobcard.install_truck && 'Truck', jobcard.install_trailer && 'Trailer',
    ].filter(Boolean).join(', ');

    const installTools = Object.entries(INSTALL_TOOL_LABELS)
        .filter(([key]) => jobcard.install_tools_json?.[key])
        .map(([, label]) => label)
        .join(', ');

    const installCrew = [
        jobcard.install_riggers && `Riggers: ${jobcard.install_riggers}`,
        jobcard.install_applicators && `Applicators: ${jobcard.install_applicators}`,
        jobcard.install_builders && `Builders: ${jobcard.install_builders}`,
        jobcard.install_minions && `Minions: ${jobcard.install_minions}`,
        jobcard.install_drivers && `Drivers: ${jobcard.install_drivers}`,
        jobcard.install_supervisors && `Supervisors: ${jobcard.install_supervisors}`,
    ].filter(Boolean).join(', ');

    return (
        <Document title={`Jobcard ${jobcard.entry_number || ''} - ${jobcard.company || ''}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    {logo ? <Image src={logo} style={styles.logo} /> : <Text style={styles.docTitle}>Aloe Signs</Text>}
                    <View style={styles.headerRight}>
                        <Text style={styles.docTitle}>Job Card</Text>
                        <Text style={styles.docSub}>
                            {jobcard.entry_number ? `Entry # ${jobcard.entry_number}` : ''}
                            {jobcard.entry_number && jobcard.date ? '  ·  ' : ''}
                            {jobcard.date || ''}
                        </Text>
                    </View>
                </View>

                {/* Customer / Job info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                        <View style={styles.infoBoxHeader}><Text style={styles.infoBoxTitle}>Customer</Text></View>
                        <View style={styles.infoBoxBody}>
                            <Field label="Company" value={jobcard.company} />
                            <Field label="Contact" value={jobcard.contact_name} />
                            <Field label="Tel" value={[jobcard.contact_phone, jobcard.contact_phone_2].filter(Boolean).join(' / ')} />
                            <Field label="Email" value={jobcard.email} />
                        </View>
                    </View>
                    {(jobcard.invoice || jobcard.quote_number || jobcard.purchase_order_number || jobcard.address) && (
                        <View style={styles.infoBox}>
                            <View style={styles.infoBoxHeader}><Text style={styles.infoBoxTitle}>Job Reference</Text></View>
                            <View style={styles.infoBoxBody}>
                                <Field label="Invoice" value={jobcard.invoice} />
                                <Field label="Quote No" value={jobcard.quote_number} />
                                <Field label="PO No" value={jobcard.purchase_order_number} />
                                <Field label="Address" value={jobcard.address} />
                            </View>
                        </View>
                    )}
                </View>

                {/* Items */}
                {items.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Items</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
                                <Text style={[styles.tableHeaderCell, styles.colSize]}>Size</Text>
                                <Text style={[styles.tableHeaderCell, styles.colItem]}>Item</Text>
                                <Text style={styles.tableHeaderCell}>Description</Text>
                            </View>
                            {items.map((item: any, idx: number) => (
                                <View style={styles.tableRow} key={idx} wrap={false}>
                                    <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                                    <Text style={[styles.tableCell, styles.colSize]}>{item.size}</Text>
                                    <Text style={[styles.tableCell, styles.colItem]}>{item.item}</Text>
                                    <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Other notes */}
                {jobcard.design_notes && (
                    <View style={styles.noteBox} wrap={false}>
                        <Text style={[styles.infoBoxTitle, { marginBottom: 4 }]}>Other Notes</Text>
                        <Text style={styles.noteText}>{jobcard.design_notes}</Text>
                    </View>
                )}

                {/* Department sections */}
                {jobcard.prod_flatbed && (
                    <DeptCard title="UV Flatbed">
                        <Field label="Qty" value={jobcard.flatbed_details_json?.qty} />
                        <Field label="Size" value={jobcard.flatbed_details_json?.size} />
                        <Field label="Type" value={jobcard.flatbed_details_json?.type} />
                        <Field label="Shape" value={jobcard.flatbed_details_json?.shape} />
                        <Field label="Mirror" value={jobcard.flatbed_details_json?.mirror} />
                        <Field label="Material" value={materials.join(', ')} />
                    </DeptCard>
                )}

                {jobcard.prod_screen && (
                    <DeptCard title="Screen">
                        <Field label="Qty" value={jobcard.screen_details_json?.qty} />
                        <Field label="Sides" value={jobcard.screen_details_json?.sides} />
                        <Field
                            label="Material"
                            value={jobcard.screen_details_json?.material === 'Other' ? jobcard.screen_details_json?.material_other : jobcard.screen_details_json?.material}
                        />
                        <Field label="Specs" value={jobcard.screen_details_json?.specs} />
                    </DeptCard>
                )}

                {jobcard.prod_applicate && (
                    <DeptCard title="Application">
                        <Field
                            label="Type"
                            value={[
                                jobcard.applicate_details_json?.lam && 'Lam',
                                jobcard.applicate_details_json?.vehicle && 'Vehicle',
                                jobcard.applicate_details_json?.on_site && 'On Site',
                            ].filter(Boolean).join(', ')}
                        />
                        <Field label="Notes" value={jobcard.applicate_details_json?.notes} />
                    </DeptCard>
                )}

                {jobcard.prod_engineer && (
                    <DeptCard title="Engineering">
                        <Field label="Qty" value={jobcard.engineer_details_json?.quantity} />
                        <Field label="Size" value={jobcard.engineer_details_json?.size} />
                        <Field label="Material" value={jobcard.engineer_details_json?.material} />
                        <Field label="Thickness" value={jobcard.engineer_details_json?.thickness} />
                        <Field label="Angle" value={jobcard.engineer_details_json?.angles} />
                    </DeptCard>
                )}

                {jobcard.track_installation && (
                    <DeptCard title="Installation">
                        <Field label="Address" value={jobcard.installation_address} />
                        <Field label="Vehicles" value={installVehicles} />
                        <Field label="Crew" value={installCrew} />
                        <Field label="Travel" value={jobcard.install_travel_km ? `${jobcard.install_travel_km} km one-way` : null} />
                        <Field label="Tools" value={installTools} />
                        <Field label="Safety file" value={jobcard.install_safety_file === true ? 'Yes' : jobcard.install_safety_file === false ? 'No' : null} />
                        <Field label="Additional" value={jobcard.install_additional} />
                    </DeptCard>
                )}

                {jobcard.track_deliver && (
                    <DeptCard title="Delivery">
                        <Field label="Address" value={jobcard.delivery_address} />
                        <Field label="Vehicles" value={deliverVehicles} />
                    </DeptCard>
                )}

                <View style={styles.footer} fixed>
                    <Text>Aloe Signs · Branding, Printing &amp; Signage</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
