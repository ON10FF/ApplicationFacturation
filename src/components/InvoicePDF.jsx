import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { width: 80, height: 80, objectFit: 'contain' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  badgePaid: { color: '#16a34a', border: '2px solid #16a34a', padding: 5, fontSize: 14, fontWeight: 'bold', transform: 'rotate(-5deg)', textAlign: 'center', width: 150, marginTop: 10 },
  badgeDelivered: { color: '#2563eb', border: '2px solid #2563eb', padding: 5, fontSize: 14, fontWeight: 'bold', transform: 'rotate(-5deg)', textAlign: 'center', width: 150, marginTop: 5 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', marginTop: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableHeader: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
  tableCol: { padding: 5, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  footerSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  stampBox: { width: 120, height: 120, border: '1px dashed #ccc', justifyContent: 'center', alignItems: 'center' },
});

export default function InvoicePDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête Entreprise & Numéro */}
        <View style={styles.header}>
          <View style={{ width: '50%' }}>
            {data.company.logo_url && <Image src={data.company.logo_url} style={styles.logo} />}
            <Text style={styles.title}>{data.company.name}</Text>
            <Text>NINEA: {data.company.ninea} | RCCM: {data.company.rccm}</Text>
            <Text>{data.company.address}</Text>
            <Text>{data.company.phone} | {data.company.email}</Text>
          </View>
          <View style={{ width: '50%', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>FACTURE</Text>
            <Text>N° {data.number}</Text>
            <Text>Date : {new Date(data.issueDate || data.issue_date || new Date().toISOString()).toLocaleDateString('fr-SN')}</Text>
            
            {/* Badges Payé / Livré */}
            {data.is_paid && (
              <View style={styles.badgePaid}>
                <Text>PAYÉ LE {new Date(data.paid_date).toLocaleDateString('fr-SN')}</Text>
                <Text style={{ fontSize: 8 }}>Via {data.payment_method}</Text>
              </View>
            )}
            {data.is_delivered && (
              <View style={styles.badgeDelivered}>
                <Text>LIVRÉ LE {new Date(data.delivered_date).toLocaleDateString('fr-SN')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Client */}
        <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#f9fafb' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Facturé à : {data.client.name}</Text>
          <Text>{data.client.address}</Text>
          {data.client.ninea && <Text>NINEA : {data.client.ninea}</Text>}
        </View>

        {/* Tableau des lignes (Simplifié pour l'exemple) */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, { width: '40%' }]}>Désignation</Text>
            <Text style={[styles.tableCol, { width: '15%' }]}>Qté</Text>
            <Text style={[styles.tableCol, { width: '20%' }]}>PU TTC</Text>
            <Text style={[styles.tableCol, { width: '25%' }]}>Total TTC</Text>
          </View>
          {data.lines.map((line, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCol, { width: '40%' }]}>{line.product_name}</Text>
              <Text style={[styles.tableCol, { width: '15%' }]}>{line.quantity}</Text>
              <Text style={[styles.tableCol, { width: '20%' }]}>{line.price_ht} FCFA</Text>
              <Text style={[styles.tableCol, { width: '25%' }]}>{line.total_ttc} FCFA</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Total TTC : {data.total_ttc} FCFA</Text>
          {data.is_paid && <Text style={{ color: 'green' }}>Montant payé : {data.paid_amount} FCFA</Text>}
        </View>

        <View style={styles.footerSection}>
          <View>
            <Text style={{ marginBottom: 10 }}>Cachet de l'entreprise :</Text>
            {data.company.stamp_image_url ? (
              <Image src={data.company.stamp_image_url} style={styles.stampBox} />
            ) : (
              <View style={[styles.stampBox, { borderRadius: 60, borderColor: 'blue' }]}>
                <Text style={{ color: 'blue', textAlign: 'center' }}>{data.company.name}</Text>
                <Text style={{ fontSize: 8, color: 'blue' }}>Cachet Numérique</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}