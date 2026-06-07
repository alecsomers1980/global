-- Generated from: C:\Users\info\Downloads\2025.11.18 FILES UPDATE - VERY IMPORTANT.xlsx
-- Run this in Supabase SQL Editor to populate id_number on cases
-- NOTE: Review before running. May need adjustment for unmatched names.

BEGIN;

-- KC003 | MONIQUE MARAIS | 8708100193085
UPDATE cases c
SET id_number = '8708100193085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MONIQUE MARAIS'))
  AND c.id_number IS NULL;

-- KC005 | TAVENGA MADINYENYA | FN 049675
UPDATE cases c
SET id_number = 'FN 049675'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TAVENGA MADINYENYA'))
  AND c.id_number IS NULL;

-- KC008 | SIMON NKOSI | 750723570 086
UPDATE cases c
SET id_number = '750723570 086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIMON NKOSI'))
  AND c.id_number IS NULL;

-- KC009 | DANIEL TOBIAS HOMAN | 6601165098087
UPDATE cases c
SET id_number = '6601165098087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DANIEL TOBIAS HOMAN'))
  AND c.id_number IS NULL;

-- KC017 | TANATSIWA NKOMO | EN308454
UPDATE cases c
SET id_number = 'EN308454'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TANATSIWA NKOMO'))
  AND c.id_number IS NULL;

-- KC018 | AMOS THULO MOSENOHI | 8811285910081
UPDATE cases c
SET id_number = '8811285910081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AMOS THULO MOSENOHI'))
  AND c.id_number IS NULL;

-- KC020 | MELUSI MAFANA METHULE | 9311075319089
UPDATE cases c
SET id_number = '9311075319089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MELUSI MAFANA METHULE'))
  AND c.id_number IS NULL;

-- KC024 | MATTHYS JOHANNES LOURENS | 6709205096084
UPDATE cases c
SET id_number = '6709205096084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MATTHYS JOHANNES LOURENS'))
  AND c.id_number IS NULL;

-- KC025 | DANIEL ANTON GOOSEN | 7109135034082
UPDATE cases c
SET id_number = '7109135034082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DANIEL ANTON GOOSEN'))
  AND c.id_number IS NULL;

-- KC029 | FRANK SERAME MOFOKENG | 9207086306083
UPDATE cases c
SET id_number = '9207086306083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANK SERAME MOFOKENG'))
  AND c.id_number IS NULL;

-- KC033 | SIPIWE CHRISTOPHER MPHUTHI | 8601016620087
UPDATE cases c
SET id_number = '8601016620087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPIWE CHRISTOPHER MPHUTHI'))
  AND c.id_number IS NULL;

-- KC036 | ALFRED KHABA DIRE | 8109165549081
UPDATE cases c
SET id_number = '8109165549081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALFRED KHABA DIRE'))
  AND c.id_number IS NULL;

-- KC041 | AVELINAH MASEGELA MAILA | 8603251168087
UPDATE cases c
SET id_number = '8603251168087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AVELINAH MASEGELA MAILA'))
  AND c.id_number IS NULL;

-- KC045 | JOSEPHINA MOHALE LEBEPE OBO OBAKENG MORABA | 0307255351081
UPDATE cases c
SET id_number = '0307255351081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOSEPHINA MOHALE LEBEPE OBO OBAKENG MORABA'))
  AND c.id_number IS NULL;

-- KC046 | JOSEPH MOTSEKI NTEE | RA663377
UPDATE cases c
SET id_number = 'RA663377'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOSEPH MOTSEKI NTEE'))
  AND c.id_number IS NULL;

-- KC048 | ANDRIES SCHOOMBEE ELOFF | 5902115092084
UPDATE cases c
SET id_number = '5902115092084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDRIES SCHOOMBEE ELOFF'))
  AND c.id_number IS NULL;

-- KC049 | LIAV PAULOS LIAU | 8501265229087
UPDATE cases c
SET id_number = '8501265229087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LIAV PAULOS LIAU'))
  AND c.id_number IS NULL;

-- KC050 | KEABETSWE LIZZY MOTHOBI | 8904061433087
UPDATE cases c
SET id_number = '8904061433087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEABETSWE LIZZY MOTHOBI'))
  AND c.id_number IS NULL;

-- KC051 | JOSEPH MBANA | 7402025768087
UPDATE cases c
SET id_number = '7402025768087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOSEPH MBANA'))
  AND c.id_number IS NULL;

-- KC054 | TANESH J PATEL | 940813519808 9
UPDATE cases c
SET id_number = '940813519808 9'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TANESH J PATEL'))
  AND c.id_number IS NULL;

-- KC057 | TUMELO SITHOLE | 9308066310085
UPDATE cases c
SET id_number = '9308066310085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TUMELO SITHOLE'))
  AND c.id_number IS NULL;

-- KC058 | RICHARD SHABANGU | 7202156591088
UPDATE cases c
SET id_number = '7202156591088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RICHARD SHABANGU'))
  AND c.id_number IS NULL;

-- KC060 | WENDY MPHAPHULI OBO | 8602030574086
UPDATE cases c
SET id_number = '8602030574086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WENDY MPHAPHULI OBO'))
  AND c.id_number IS NULL;

-- KC062 | M JOHANNES MATJILA | 8304076304086
UPDATE cases c
SET id_number = '8304076304086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('M JOHANNES MATJILA'))
  AND c.id_number IS NULL;

-- KC063 | ESHELL DASS | 7811035152084
UPDATE cases c
SET id_number = '7811035152084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ESHELL DASS'))
  AND c.id_number IS NULL;

-- KC065 | LINDIWE CAMMEY SKOSANA | 6209190599085
UPDATE cases c
SET id_number = '6209190599085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LINDIWE CAMMEY SKOSANA'))
  AND c.id_number IS NULL;

-- KC067 | KHONZAPHI MATHOLA | MANDATE TERMINATED
UPDATE cases c
SET id_number = 'MANDATE TERMINATED'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHONZAPHI MATHOLA'))
  AND c.id_number IS NULL;

-- KC068 | THSEPO ZWANE | 9105015581083
UPDATE cases c
SET id_number = '9105015581083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THSEPO ZWANE'))
  AND c.id_number IS NULL;

-- KC069 | CLIFFORD MATHEBULA | 9402065991084
UPDATE cases c
SET id_number = '9402065991084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CLIFFORD MATHEBULA'))
  AND c.id_number IS NULL;

-- KC070 | MUSA NKOSI | 8610125292084
UPDATE cases c
SET id_number = '8610125292084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MUSA NKOSI'))
  AND c.id_number IS NULL;

-- KC073 | EMMA MOLOI OBO MOKWATLO | 0110040445089
UPDATE cases c
SET id_number = '0110040445089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EMMA MOLOI OBO MOKWATLO'))
  AND c.id_number IS NULL;

-- KC074 | BANNANA MAKUA | 8508135357089
UPDATE cases c
SET id_number = '8508135357089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BANNANA MAKUA'))
  AND c.id_number IS NULL;

-- KC075 | JOEY C FAUL | 6310130232082
UPDATE cases c
SET id_number = '6310130232082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOEY C FAUL'))
  AND c.id_number IS NULL;

-- KC076 | JUDAIDA MOLEFE | 5503020722085
UPDATE cases c
SET id_number = '5503020722085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JUDAIDA MOLEFE'))
  AND c.id_number IS NULL;

-- KC077 | M JOHANNES MALOBANE | 7403315456086 CLIENT DEAD
UPDATE cases c
SET id_number = '7403315456086 CLIENT DEAD'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('M JOHANNES MALOBANE'))
  AND c.id_number IS NULL;

-- KC081 | P DECK MAWILA | 7809175368080
UPDATE cases c
SET id_number = '7809175368080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('P DECK MAWILA'))
  AND c.id_number IS NULL;

-- KC087 | M MARY-JANE MABELA | 6502180501081
UPDATE cases c
SET id_number = '6502180501081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('M MARY-JANE MABELA'))
  AND c.id_number IS NULL;

-- KC090 | T MACDONALD MATHEBE | 9308195417082
UPDATE cases c
SET id_number = '9308195417082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('T MACDONALD MATHEBE'))
  AND c.id_number IS NULL;

-- KC100 | V BRIEDENHANN obo HANNES PRAEG | 6509130100088
UPDATE cases c
SET id_number = '6509130100088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('V BRIEDENHANN obo HANNES PRAEG'))
  AND c.id_number IS NULL;

-- KC103 | N MAVIS MAUPA | 8009191052086
UPDATE cases c
SET id_number = '8009191052086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('N MAVIS MAUPA'))
  AND c.id_number IS NULL;

-- KC108 | ALFRED LYTON | MA255414
UPDATE cases c
SET id_number = 'MA255414'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALFRED LYTON'))
  AND c.id_number IS NULL;

-- KC110 | G SHIKO MONAGENG | 7911295877089
UPDATE cases c
SET id_number = '7911295877089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('G SHIKO MONAGENG'))
  AND c.id_number IS NULL;

-- KC113 | SIFISO S THOBELA | 8311155398087
UPDATE cases c
SET id_number = '8311155398087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIFISO S THOBELA'))
  AND c.id_number IS NULL;

-- KC114 | MONICA A NDLOVU | 6101130591084
UPDATE cases c
SET id_number = '6101130591084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MONICA A NDLOVU'))
  AND c.id_number IS NULL;

-- KC115 | S ABIEL MAKABETHE | MANDATE TERMINATED
UPDATE cases c
SET id_number = 'MANDATE TERMINATED'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('S ABIEL MAKABETHE'))
  AND c.id_number IS NULL;

-- KC117 | WISEMAN M MTSHALI | 940830 6019 080
UPDATE cases c
SET id_number = '940830 6019 080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WISEMAN M MTSHALI'))
  AND c.id_number IS NULL;

-- KC119 | MIKE JB SCHMIT | 5910025032082
UPDATE cases c
SET id_number = '5910025032082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MIKE JB SCHMIT'))
  AND c.id_number IS NULL;

-- KC126 | MD MADONSELA | MANDATE TERMINATED
UPDATE cases c
SET id_number = 'MANDATE TERMINATED'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MD MADONSELA'))
  AND c.id_number IS NULL;

-- KC127 | EPHRAIM CHABALALA | MANDATE TERMINATED
UPDATE cases c
SET id_number = 'MANDATE TERMINATED'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EPHRAIM CHABALALA'))
  AND c.id_number IS NULL;

-- KC130 | DEON LE ROUX | 8904265053087
UPDATE cases c
SET id_number = '8904265053087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DEON LE ROUX'))
  AND c.id_number IS NULL;

-- KC133 | MARTHA MAHLANGU OBO A | 6912210391082
UPDATE cases c
SET id_number = '6912210391082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARTHA MAHLANGU OBO A'))
  AND c.id_number IS NULL;

-- KC135 | E MORITHI obo MINOR | 6505155347083
UPDATE cases c
SET id_number = '6505155347083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('E MORITHI obo MINOR'))
  AND c.id_number IS NULL;

-- KC136 | BILLY OOSTHUIZEN | 7001015012082
UPDATE cases c
SET id_number = '7001015012082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BILLY OOSTHUIZEN'))
  AND c.id_number IS NULL;

-- KC137 | FULUFHELO MAKHOMU | 7909240505086
UPDATE cases c
SET id_number = '7909240505086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FULUFHELO MAKHOMU'))
  AND c.id_number IS NULL;

-- KC139 | MMATHABO MOIKETSI | 0107230930086
UPDATE cases c
SET id_number = '0107230930086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MMATHABO MOIKETSI'))
  AND c.id_number IS NULL;

-- KC140 | NATHANAEL MALEFETSANE MOIKETSI | 7111285585087
UPDATE cases c
SET id_number = '7111285585087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NATHANAEL MALEFETSANE MOIKETSI'))
  AND c.id_number IS NULL;

-- KC141 | NP LEKGETHO OBO ASSEMBLY | 7611300737084
UPDATE cases c
SET id_number = '7611300737084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NP LEKGETHO OBO ASSEMBLY'))
  AND c.id_number IS NULL;

-- KC145 | MM MATLAKANENG | 8004155651080
UPDATE cases c
SET id_number = '8004155651080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MM MATLAKANENG'))
  AND c.id_number IS NULL;

-- KC146 | RAMA MANTSHONA VS AMANDA VD LITH | 6103015789080
UPDATE cases c
SET id_number = '6103015789080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RAMA MANTSHONA VS AMANDA VD LITH'))
  AND c.id_number IS NULL;

-- KC147 | MA RAMAKGAPOLA OBO KA | 6708070570082
UPDATE cases c
SET id_number = '6708070570082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MA RAMAKGAPOLA OBO KA'))
  AND c.id_number IS NULL;

-- KC149 | KOKETSO MABAPA | 8904156271087
UPDATE cases c
SET id_number = '8904156271087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KOKETSO MABAPA'))
  AND c.id_number IS NULL;

-- KC155 | KEDIBONE THABITA KOMANE | 9107260557081
UPDATE cases c
SET id_number = '9107260557081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEDIBONE THABITA KOMANE'))
  AND c.id_number IS NULL;

-- KC156 | GERHARD BRONKHORST | 6811215111083
UPDATE cases c
SET id_number = '6811215111083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GERHARD BRONKHORST'))
  AND c.id_number IS NULL;

-- KC158 | GEORGE GUMBU | 7809166027083
UPDATE cases c
SET id_number = '7809166027083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GEORGE GUMBU'))
  AND c.id_number IS NULL;

-- KC162 | O DAVID MASWABI | 8405145490085
UPDATE cases c
SET id_number = '8405145490085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('O DAVID MASWABI'))
  AND c.id_number IS NULL;

-- KC163 | EPHRAIM MORITHI | SAME AS KC135
UPDATE cases c
SET id_number = 'SAME AS KC135'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EPHRAIM MORITHI'))
  AND c.id_number IS NULL;

-- KC164 | KHALIPHILE MANTSHOLO | 6905205092087
UPDATE cases c
SET id_number = '6905205092087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHALIPHILE MANTSHOLO'))
  AND c.id_number IS NULL;

-- KC165 | LEE LOUBSER | 9411230019085
UPDATE cases c
SET id_number = '9411230019085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LEE LOUBSER'))
  AND c.id_number IS NULL;

-- KC167 | MARTHINUS BOSCH | 9410035035080
UPDATE cases c
SET id_number = '9410035035080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARTHINUS BOSCH'))
  AND c.id_number IS NULL;

-- KC169 | NEDI AMON TIVANA | 30MC27507
UPDATE cases c
SET id_number = '30MC27507'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NEDI AMON TIVANA'))
  AND c.id_number IS NULL;

-- KC171 | DARRYL KRUGER | 8504035232084
UPDATE cases c
SET id_number = '8504035232084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DARRYL KRUGER'))
  AND c.id_number IS NULL;

-- KC177 | ALSON SIBEKO | 8408285834088
UPDATE cases c
SET id_number = '8408285834088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALSON SIBEKO'))
  AND c.id_number IS NULL;

-- KC178 | ELLIOT RADEBE | 7501295472088
UPDATE cases c
SET id_number = '7501295472088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELLIOT RADEBE'))
  AND c.id_number IS NULL;

-- KC185 | MARCEL COMBRINK | 9611215060083
UPDATE cases c
SET id_number = '9611215060083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARCEL COMBRINK'))
  AND c.id_number IS NULL;

-- KC186 | WELDEMARIAM H DELKERO | 1198211008
UPDATE cases c
SET id_number = '1198211008'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WELDEMARIAM H DELKERO'))
  AND c.id_number IS NULL;

-- KC188 | LAUREN MGUNI | 84006915N28
UPDATE cases c
SET id_number = '84006915N28'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LAUREN MGUNI'))
  AND c.id_number IS NULL;

-- KC189 | TSEPO THOMAS MAKHUBELA | 7706145399080
UPDATE cases c
SET id_number = '7706145399080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSEPO THOMAS MAKHUBELA'))
  AND c.id_number IS NULL;

-- KC190 | OUMAN JOHANNES MAGOLA | 9203066084089
UPDATE cases c
SET id_number = '9203066084089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OUMAN JOHANNES MAGOLA'))
  AND c.id_number IS NULL;

-- KC192 | KENNETSWE M MOENG | 6209200960087
UPDATE cases c
SET id_number = '6209200960087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KENNETSWE M MOENG'))
  AND c.id_number IS NULL;

-- KC193 | BOITUMELO G SEGALOE | 9902041155084
UPDATE cases c
SET id_number = '9902041155084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOITUMELO G SEGALOE'))
  AND c.id_number IS NULL;

-- KC194 | GLEN VISSER | 6601155134082
UPDATE cases c
SET id_number = '6601155134082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GLEN VISSER'))
  AND c.id_number IS NULL;

-- KC198 | ANDRIONETTE SUSAN BESTER | 8411070036083
UPDATE cases c
SET id_number = '8411070036083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDRIONETTE SUSAN BESTER'))
  AND c.id_number IS NULL;

-- KC201 | RAYWAIDEAN COMBRINK | 9304065961085
UPDATE cases c
SET id_number = '9304065961085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RAYWAIDEAN COMBRINK'))
  AND c.id_number IS NULL;

-- KC206 | CORNELIUS KGASU | 6002025949082
UPDATE cases c
SET id_number = '6002025949082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CORNELIUS KGASU'))
  AND c.id_number IS NULL;

-- KC207 | DAVID ERNESTO MATOLO | AB0999713
UPDATE cases c
SET id_number = 'AB0999713'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID ERNESTO MATOLO'))
  AND c.id_number IS NULL;

-- KC209 | HENRI PRETORIUS | 8901245117081
UPDATE cases c
SET id_number = '8901245117081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HENRI PRETORIUS'))
  AND c.id_number IS NULL;

-- KC215 | NKWATA MARIA MALEMA | 6507300499082
UPDATE cases c
SET id_number = '6507300499082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKWATA MARIA MALEMA'))
  AND c.id_number IS NULL;

-- KC218 | THOKO NGOBENI | 9202250777086
UPDATE cases c
SET id_number = '9202250777086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOKO NGOBENI'))
  AND c.id_number IS NULL;

-- KC222 | THOMAS MAZIWONKE | 7506186068085
UPDATE cases c
SET id_number = '7506186068085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOMAS MAZIWONKE'))
  AND c.id_number IS NULL;

-- KC227 | CONVEY MEINTJIES | 8710145074080
UPDATE cases c
SET id_number = '8710145074080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CONVEY MEINTJIES'))
  AND c.id_number IS NULL;

-- KC233 | MPHELETSHEDZENI NELSON NETSHIDZIVHANI obo LAVHELESANI EVIDENCE NETSHIDZIVHANI | 6905026006084 /
UPDATE cases c
SET id_number = '6905026006084 /'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPHELETSHEDZENI NELSON NETSHIDZIVHANI obo LAVHELESANI EVIDENCE NETSHIDZIVHANI'))
  AND c.id_number IS NULL;

-- KC235 | SIPHE PITSA | 9106106565084
UPDATE cases c
SET id_number = '9106106565084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHE PITSA'))
  AND c.id_number IS NULL;

-- KCS250 | LEIGH-ANN SHELLEY VAN WYK | 701210022508 3
UPDATE cases c
SET id_number = '701210022508 3'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LEIGH-ANN SHELLEY VAN WYK'))
  AND c.id_number IS NULL;

-- KCS259 | THABO JOHANNES RAMATLHWARE | 8503015908085
UPDATE cases c
SET id_number = '8503015908085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO JOHANNES RAMATLHWARE'))
  AND c.id_number IS NULL;

-- KCS260 | LEIGH-ANN SHELLEY VAN WYK - 1E ONGELUK | 701210022508 3
UPDATE cases c
SET id_number = '701210022508 3'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LEIGH-ANN SHELLEY VAN WYK - 1E ONGELUK'))
  AND c.id_number IS NULL;

-- KCS263 | ELIZABETH GRACE CHANGESI | 6505051425082
UPDATE cases c
SET id_number = '6505051425082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZABETH GRACE CHANGESI'))
  AND c.id_number IS NULL;

-- KCS273 | NOMSA MDLULI | 8801041344089
UPDATE cases c
SET id_number = '8801041344089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOMSA MDLULI'))
  AND c.id_number IS NULL;

-- KC274 | SEAN MARTIN VAN ROOYEN | 7609175306084
UPDATE cases c
SET id_number = '7609175306084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SEAN MARTIN VAN ROOYEN'))
  AND c.id_number IS NULL;

-- KCj284 | SUSARA CORNELIA SMAL | 8103031344082
UPDATE cases c
SET id_number = '8103031344082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUSARA CORNELIA SMAL'))
  AND c.id_number IS NULL;

-- KCj285 | SUSARA CORNELIA SMAL OBO CHRIZELDA-ANN SMAL | 8103031344082
UPDATE cases c
SET id_number = '8103031344082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUSARA CORNELIA SMAL OBO CHRIZELDA-ANN SMAL'))
  AND c.id_number IS NULL;

-- KCj289 | RENIER SMAL | 6207185048084
UPDATE cases c
SET id_number = '6207185048084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RENIER SMAL'))
  AND c.id_number IS NULL;

-- KCj290 | JANETTA HENDRINA MALAN | 6901190046089
UPDATE cases c
SET id_number = '6901190046089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JANETTA HENDRINA MALAN'))
  AND c.id_number IS NULL;

-- KCj291 | EMMERENTIA BARNARD | 6107030019084
UPDATE cases c
SET id_number = '6107030019084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EMMERENTIA BARNARD'))
  AND c.id_number IS NULL;

-- KCj292 | DAVID GREGORY STEENKAMP | 830603 5116 089
UPDATE cases c
SET id_number = '830603 5116 089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID GREGORY STEENKAMP'))
  AND c.id_number IS NULL;

-- KCJ295 | HEINRICH MARALDO | 8609235002086
UPDATE cases c
SET id_number = '8609235002086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HEINRICH MARALDO'))
  AND c.id_number IS NULL;

-- KCj297 | HENRY ENSLIN | 4907155176086
UPDATE cases c
SET id_number = '4907155176086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HENRY ENSLIN'))
  AND c.id_number IS NULL;

-- KCj298 | MICHEL ROESTORFF OBO LEEHANEE ROESTORFF | 8606090206083
UPDATE cases c
SET id_number = '8606090206083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MICHEL ROESTORFF OBO LEEHANEE ROESTORFF'))
  AND c.id_number IS NULL;

-- KCs299 | TINYIKO PHINAH SHAYI OBO MASINGITA NEO SHAYI | 0508186484087
UPDATE cases c
SET id_number = '0508186484087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TINYIKO PHINAH SHAYI OBO MASINGITA NEO SHAYI'))
  AND c.id_number IS NULL;

-- KCs300 | REFILOE CATHERINE NKUNA OBO MINORS | 9202220820081
UPDATE cases c
SET id_number = '9202220820081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('REFILOE CATHERINE NKUNA OBO MINORS'))
  AND c.id_number IS NULL;

-- KCj304 | ELIZABETH LOMBARD OBO RUDOLPH GERHARD FRITZ | 041221 5730 083
UPDATE cases c
SET id_number = '041221 5730 083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZABETH LOMBARD OBO RUDOLPH GERHARD FRITZ'))
  AND c.id_number IS NULL;

-- KCj306 | BERNADETTE THOMAS OBO AIDAN THOMAS | 0506285175085
UPDATE cases c
SET id_number = '0506285175085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BERNADETTE THOMAS OBO AIDAN THOMAS'))
  AND c.id_number IS NULL;

-- KCj307 | JENNIFER JOAN VAN WYK | 8301220180081
UPDATE cases c
SET id_number = '8301220180081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JENNIFER JOAN VAN WYK'))
  AND c.id_number IS NULL;

-- KCs313 | JANE PONATSHEGO MAIMANE OBO REMORATILE | 9412060482088
UPDATE cases c
SET id_number = '9412060482088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JANE PONATSHEGO MAIMANE OBO REMORATILE'))
  AND c.id_number IS NULL;

-- KCs317 | SIPHO MKHONDO | 7806056370086
UPDATE cases c
SET id_number = '7806056370086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHO MKHONDO'))
  AND c.id_number IS NULL;

-- KCj321 | MARINUS COETZEE | 9208245006085
UPDATE cases c
SET id_number = '9208245006085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARINUS COETZEE'))
  AND c.id_number IS NULL;

-- KCs324 | THSEPISO DINEO SOSIBO | 0004261324083
UPDATE cases c
SET id_number = '0004261324083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THSEPISO DINEO SOSIBO'))
  AND c.id_number IS NULL;

-- KCs325 | NICOLE OOSTHUIZEN | 9806190067083
UPDATE cases c
SET id_number = '9806190067083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NICOLE OOSTHUIZEN'))
  AND c.id_number IS NULL;

-- KC331 | RENIER SMAL | 8506065088080
UPDATE cases c
SET id_number = '8506065088080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RENIER SMAL'))
  AND c.id_number IS NULL;

-- KCS333 | GUAULETHU SILWANE | 8003180596088
UPDATE cases c
SET id_number = '8003180596088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GUAULETHU SILWANE'))
  AND c.id_number IS NULL;

-- KCS347 | JOSHUA IAN VAN WYK | 9904065742086
UPDATE cases c
SET id_number = '9904065742086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOSHUA IAN VAN WYK'))
  AND c.id_number IS NULL;

-- KCS351 | NHLABATHI OBO M.J. XABA | 0312225521086
UPDATE cases c
SET id_number = '0312225521086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NHLABATHI OBO M.J. XABA'))
  AND c.id_number IS NULL;

-- KC356 | DAVID MARK HUXTABLE | 7702025059084
UPDATE cases c
SET id_number = '7702025059084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID MARK HUXTABLE'))
  AND c.id_number IS NULL;

-- KCS357 | MEGAN FOURIE | 9806130132088
UPDATE cases c
SET id_number = '9806130132088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MEGAN FOURIE'))
  AND c.id_number IS NULL;

-- KC359 | PETRONELLA DU PLOOY | 7701060182082
UPDATE cases c
SET id_number = '7701060182082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PETRONELLA DU PLOOY'))
  AND c.id_number IS NULL;

-- KC366 | DAMOND VAN DER WALT | 7809255245083
UPDATE cases c
SET id_number = '7809255245083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAMOND VAN DER WALT'))
  AND c.id_number IS NULL;

-- KC368 | OFENTSE MATABOGE MATJEBE | 85091410863087
UPDATE cases c
SET id_number = '85091410863087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OFENTSE MATABOGE MATJEBE'))
  AND c.id_number IS NULL;

-- KC371 | ARMAND WILHELM VAN JAARSVELD | 8803145130083
UPDATE cases c
SET id_number = '8803145130083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ARMAND WILHELM VAN JAARSVELD'))
  AND c.id_number IS NULL;

-- KC372 | OLEBOGEG REVELATION MORONGWE | 860520 6307 082
UPDATE cases c
SET id_number = '860520 6307 082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OLEBOGEG REVELATION MORONGWE'))
  AND c.id_number IS NULL;

-- KCS376 | SEMANE KHAMA | BN0727580
UPDATE cases c
SET id_number = 'BN0727580'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SEMANE KHAMA'))
  AND c.id_number IS NULL;

-- KC379 | WERNER NEL | 9301135009085
UPDATE cases c
SET id_number = '9301135009085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WERNER NEL'))
  AND c.id_number IS NULL;

-- KC380 | THABANG CHAUKE | 0105045990089
UPDATE cases c
SET id_number = '0105045990089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG CHAUKE'))
  AND c.id_number IS NULL;

-- KC382 | MATHOLE NTLOBA | 5604120265081
UPDATE cases c
SET id_number = '5604120265081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MATHOLE NTLOBA'))
  AND c.id_number IS NULL;

-- KC383 | MARISKA NEL | 9107220034080
UPDATE cases c
SET id_number = '9107220034080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARISKA NEL'))
  AND c.id_number IS NULL;

-- KC385 | ARRIE WILLEM CLAASENS | 5805145014087
UPDATE cases c
SET id_number = '5805145014087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ARRIE WILLEM CLAASENS'))
  AND c.id_number IS NULL;

-- KCS386 | TSHOTLEGO JEREMIA KOPAMOTSE | 8505136072089
UPDATE cases c
SET id_number = '8505136072089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHOTLEGO JEREMIA KOPAMOTSE'))
  AND c.id_number IS NULL;

-- KC387 | ELIZABETH HYBRECHT CLAASENS | 5810290001087
UPDATE cases c
SET id_number = '5810290001087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZABETH HYBRECHT CLAASENS'))
  AND c.id_number IS NULL;

-- KCS390 | THLAKUNG JOHN NAKEDI | 8206245629089
UPDATE cases c
SET id_number = '8206245629089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THLAKUNG JOHN NAKEDI'))
  AND c.id_number IS NULL;

-- KCS391 | PUSELETSO ELIZABETH MOLELENGOANE | 9010091110080
UPDATE cases c
SET id_number = '9010091110080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PUSELETSO ELIZABETH MOLELENGOANE'))
  AND c.id_number IS NULL;

-- KC392 | BUSISWE MARTHA SHONGWE | 7911110387082
UPDATE cases c
SET id_number = '7911110387082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BUSISWE MARTHA SHONGWE'))
  AND c.id_number IS NULL;

-- KC393 | KIMBREAN KOTZE | 9711145264084
UPDATE cases c
SET id_number = '9711145264084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KIMBREAN KOTZE'))
  AND c.id_number IS NULL;

-- KCS396 | ALBERT CHIBULELO | PTAMOZ041522484
UPDATE cases c
SET id_number = 'PTAMOZ041522484'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALBERT CHIBULELO'))
  AND c.id_number IS NULL;

-- KCS399 | NIOLIEN SMITH | 7308050050087
UPDATE cases c
SET id_number = '7308050050087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NIOLIEN SMITH'))
  AND c.id_number IS NULL;

-- KC400 | SUSANNA EUODIA FOURIE | 5904020020085
UPDATE cases c
SET id_number = '5904020020085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUSANNA EUODIA FOURIE'))
  AND c.id_number IS NULL;

-- KCS405 | PORTIA FELICIA BERNADINE KOK OBO KHLOE MUFUNWA GRACIAS MARTIN-MASHAMBA LOSS | 1106040112082
UPDATE cases c
SET id_number = '1106040112082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PORTIA FELICIA BERNADINE KOK OBO KHLOE MUFUNWA GRACIAS MARTIN-MASHAMBA LOSS'))
  AND c.id_number IS NULL;

-- KCS409 | RAJESVARI TERISHA NAIDOO | 9408120198086
UPDATE cases c
SET id_number = '9408120198086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RAJESVARI TERISHA NAIDOO'))
  AND c.id_number IS NULL;

-- KCS413 | MICHAEL MDUDUZI WELSHER | 7712076017086
UPDATE cases c
SET id_number = '7712076017086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MICHAEL MDUDUZI WELSHER'))
  AND c.id_number IS NULL;

-- KCS417 | VUYANI MSINDISENI KOMITYI | 951001 6188 087
UPDATE cases c
SET id_number = '951001 6188 087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUYANI MSINDISENI KOMITYI'))
  AND c.id_number IS NULL;

-- KCS419 | NONKANYISO DLAMINI | 0305110659086
UPDATE cases c
SET id_number = '0305110659086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NONKANYISO DLAMINI'))
  AND c.id_number IS NULL;

-- KCS421 | SIPHIWE SANGWENI | 8606056723089
UPDATE cases c
SET id_number = '8606056723089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHIWE SANGWENI'))
  AND c.id_number IS NULL;

-- KCS424 | MOLATELO ALEX SEPANE | 9002115751080
UPDATE cases c
SET id_number = '9002115751080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLATELO ALEX SEPANE'))
  AND c.id_number IS NULL;

-- KCS425 | WERNER RAS | 8211075027081
UPDATE cases c
SET id_number = '8211075027081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WERNER RAS'))
  AND c.id_number IS NULL;

-- KCS427 | LODEWIKUS VAN DER MERWE WHITE - PERSONAL CLAIM | 9001115014085
UPDATE cases c
SET id_number = '9001115014085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LODEWIKUS VAN DER MERWE WHITE - PERSONAL CLAIM'))
  AND c.id_number IS NULL;

-- KCS431 | JABULA MAGWEBU | 6003165642081
UPDATE cases c
SET id_number = '6003165642081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JABULA MAGWEBU'))
  AND c.id_number IS NULL;

-- KCS432 | ULISHA SUKRAJ | 8705040190088
UPDATE cases c
SET id_number = '8705040190088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ULISHA SUKRAJ'))
  AND c.id_number IS NULL;

-- KCS436 | SFISO TAKATSO JESSY-LEE MADIBA | 9708055187081
UPDATE cases c
SET id_number = '9708055187081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SFISO TAKATSO JESSY-LEE MADIBA'))
  AND c.id_number IS NULL;

-- KCS438 | PABALLO THOBAKGALE | 000229 5087 080
UPDATE cases c
SET id_number = '000229 5087 080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PABALLO THOBAKGALE'))
  AND c.id_number IS NULL;

-- KCS444 | MOLAHLOE PAULUS MAQEKOANE | 7907235464087
UPDATE cases c
SET id_number = '7907235464087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLAHLOE PAULUS MAQEKOANE'))
  AND c.id_number IS NULL;

-- KCS445 | MOTHUSI TIHELO | 9811065750086
UPDATE cases c
SET id_number = '9811065750086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOTHUSI TIHELO'))
  AND c.id_number IS NULL;

-- KCS446 | AHMED SHERWIN BYNEVELD | 8911295244081
UPDATE cases c
SET id_number = '8911295244081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AHMED SHERWIN BYNEVELD'))
  AND c.id_number IS NULL;

-- KC449 | VERONICA VAN NIEKERK | 6302050211089
UPDATE cases c
SET id_number = '6302050211089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VERONICA VAN NIEKERK'))
  AND c.id_number IS NULL;

-- KC455 | THABO MAKGETLANENG | 8809045844087
UPDATE cases c
SET id_number = '8809045844087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO MAKGETLANENG'))
  AND c.id_number IS NULL;

-- KC456 | CHRISTOPPER TSHABALALA | 7702025581087
UPDATE cases c
SET id_number = '7702025581087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTOPPER TSHABALALA'))
  AND c.id_number IS NULL;

-- KCM461 | ELINA C MOHLAMONYANE | 6410290386080
UPDATE cases c
SET id_number = '6410290386080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELINA C MOHLAMONYANE'))
  AND c.id_number IS NULL;

-- KC462 | GLYNNYS JANSE VAN VUUREN | 7303040056088
UPDATE cases c
SET id_number = '7303040056088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GLYNNYS JANSE VAN VUUREN'))
  AND c.id_number IS NULL;

-- KC463 | BEN PHILLIP HOFFELDT | 7701075098083
UPDATE cases c
SET id_number = '7701075098083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BEN PHILLIP HOFFELDT'))
  AND c.id_number IS NULL;

-- KC466 | DUMISANE ISAAC KHUMALO | /901220 5953 082
UPDATE cases c
SET id_number = '/901220 5953 082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DUMISANE ISAAC KHUMALO'))
  AND c.id_number IS NULL;

-- KC467 | CORNELIUS KGASU OBO KOMOHELO | 8110185220083
UPDATE cases c
SET id_number = '8110185220083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CORNELIUS KGASU OBO KOMOHELO'))
  AND c.id_number IS NULL;

-- KC468 | KABELO PITSE | 9806095425089
UPDATE cases c
SET id_number = '9806095425089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KABELO PITSE'))
  AND c.id_number IS NULL;

-- KC470 | DHLAMGA BETTY MAHLANGU | 700607 0774 088
UPDATE cases c
SET id_number = '700607 0774 088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DHLAMGA BETTY MAHLANGU'))
  AND c.id_number IS NULL;

-- KC471 | CHRISTEL NAUDE | 7502140099084
UPDATE cases c
SET id_number = '7502140099084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTEL NAUDE'))
  AND c.id_number IS NULL;

-- KC472 | KIRSTEN POOLE | 9809110428088
UPDATE cases c
SET id_number = '9809110428088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KIRSTEN POOLE'))
  AND c.id_number IS NULL;

-- KCS475 | STEYTLER | 8509115155089
UPDATE cases c
SET id_number = '8509115155089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('STEYTLER'))
  AND c.id_number IS NULL;

-- KC479 | THATO BERTHA NKOKHA | 9707210594082
UPDATE cases c
SET id_number = '9707210594082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THATO BERTHA NKOKHA'))
  AND c.id_number IS NULL;

-- KC480 | INNOCENT THEMBEKILE MALAKOANE | 830913 6352 082
UPDATE cases c
SET id_number = '830913 6352 082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('INNOCENT THEMBEKILE MALAKOANE'))
  AND c.id_number IS NULL;

-- KC483 | BRIGHTON NGUGA | AE089164
UPDATE cases c
SET id_number = 'AE089164'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BRIGHTON NGUGA'))
  AND c.id_number IS NULL;

-- KC485 | HERBERT SKHUMBUZO MOLEFE | 7212265512081
UPDATE cases c
SET id_number = '7212265512081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HERBERT SKHUMBUZO MOLEFE'))
  AND c.id_number IS NULL;

-- KC490 | SELLO CRY BALOYI | 9611225769087
UPDATE cases c
SET id_number = '9611225769087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SELLO CRY BALOYI'))
  AND c.id_number IS NULL;

-- KC491 | DONOVAN KRAUSE OBO KEITH KRAUSE | 8812065121089 & 140911 6233083
UPDATE cases c
SET id_number = '8812065121089 & 140911 6233083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DONOVAN KRAUSE OBO KEITH KRAUSE'))
  AND c.id_number IS NULL;

-- KC492 | RENIER SMAL | 8506065088088
UPDATE cases c
SET id_number = '8506065088088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RENIER SMAL'))
  AND c.id_number IS NULL;

-- KC493 | KARIN ELIZE STOLTZ | 6406280027080
UPDATE cases c
SET id_number = '6406280027080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KARIN ELIZE STOLTZ'))
  AND c.id_number IS NULL;

-- KC494 | ZEENAT VALLIE obo YAHYA SHEIK | 8306180228085
UPDATE cases c
SET id_number = '8306180228085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZEENAT VALLIE obo YAHYA SHEIK'))
  AND c.id_number IS NULL;

-- KC496 | JOHANNA MAGRIETA MAGDALENA PELSER | 8110200075082
UPDATE cases c
SET id_number = '8110200075082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNA MAGRIETA MAGDALENA PELSER'))
  AND c.id_number IS NULL;

-- KCM497 | LORDWICH MATHEBJANE MATHABATHA | 9202105903085
UPDATE cases c
SET id_number = '9202105903085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LORDWICH MATHEBJANE MATHABATHA'))
  AND c.id_number IS NULL;

-- KC498 | BRIAN ITUMELENG TLHABETSANG | 9408305115087
UPDATE cases c
SET id_number = '9408305115087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BRIAN ITUMELENG TLHABETSANG'))
  AND c.id_number IS NULL;

-- KCS499 | DAVID WA MPUTU LUBWEBWE LUAKUSHILA | FOREIGNER
UPDATE cases c
SET id_number = 'FOREIGNER'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID WA MPUTU LUBWEBWE LUAKUSHILA'))
  AND c.id_number IS NULL;

-- KCS501 | GIVEN SYDNEY MSIZA | 8205026163087
UPDATE cases c
SET id_number = '8205026163087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GIVEN SYDNEY MSIZA'))
  AND c.id_number IS NULL;

-- KCS502 | TINYIKO LAWRENCE MABALE | 7006035820083
UPDATE cases c
SET id_number = '7006035820083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TINYIKO LAWRENCE MABALE'))
  AND c.id_number IS NULL;

-- KC507 | WILLEM CORNELIUS CROUWKAMP | 5709085029081
UPDATE cases c
SET id_number = '5709085029081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLEM CORNELIUS CROUWKAMP'))
  AND c.id_number IS NULL;

-- KCS508 | KARABO NTINA MASOTE OBO PHETOGO E MASOTE | 9005240233080
UPDATE cases c
SET id_number = '9005240233080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KARABO NTINA MASOTE OBO PHETOGO E MASOTE'))
  AND c.id_number IS NULL;

-- KCS509 | TRYMORE MUTEKWA | FN875501
UPDATE cases c
SET id_number = 'FN875501'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TRYMORE MUTEKWA'))
  AND c.id_number IS NULL;

-- KCS510 | VIOLET MOHLALA TSHABALALA | 8902130308082
UPDATE cases c
SET id_number = '8902130308082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VIOLET MOHLALA TSHABALALA'))
  AND c.id_number IS NULL;

-- KCS511 | ANTHONY MUZWARIYA | 83-067948X83
UPDATE cases c
SET id_number = '83-067948X83'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANTHONY MUZWARIYA'))
  AND c.id_number IS NULL;

-- KCS513 | OSCAR THOKE | 8003075795084
UPDATE cases c
SET id_number = '8003075795084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OSCAR THOKE'))
  AND c.id_number IS NULL;

-- KCS515 | DRIEKA BASTAR OBO LEONTEIY BASTAR | 0706045970086
UPDATE cases c
SET id_number = '0706045970086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DRIEKA BASTAR OBO LEONTEIY BASTAR'))
  AND c.id_number IS NULL;

-- KCS516 | DUDU ELIZABETH SKOSANA OBO PRAYER NONHLE SKOSANA | 8009080320081
UPDATE cases c
SET id_number = '8009080320081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DUDU ELIZABETH SKOSANA OBO PRAYER NONHLE SKOSANA'))
  AND c.id_number IS NULL;

-- KC517 | MARTHIE NICKHOLS | 9003060059081
UPDATE cases c
SET id_number = '9003060059081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARTHIE NICKHOLS'))
  AND c.id_number IS NULL;

-- KCS518 | DARIUS RATHABENG PHALE | 6704185466084
UPDATE cases c
SET id_number = '6704185466084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DARIUS RATHABENG PHALE'))
  AND c.id_number IS NULL;

-- KCS519 | JOHANNES THULANI MAHLANGU | 800615 5318 081
UPDATE cases c
SET id_number = '800615 5318 081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNES THULANI MAHLANGU'))
  AND c.id_number IS NULL;

-- KCS521 | MARIA RAISIBE MADONSELA | 8112030932086
UPDATE cases c
SET id_number = '8112030932086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARIA RAISIBE MADONSELA'))
  AND c.id_number IS NULL;

-- KCS525 | ONKGAPOTSE EVIDENCE MATSEKE | 8512045654080
UPDATE cases c
SET id_number = '8512045654080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ONKGAPOTSE EVIDENCE MATSEKE'))
  AND c.id_number IS NULL;

-- KC528 | DINEO REINETH MAROGA | 930514 0361 084
UPDATE cases c
SET id_number = '930514 0361 084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DINEO REINETH MAROGA'))
  AND c.id_number IS NULL;

-- KCS529 | JACQUEMART KONZOLI MBIATO | OB00613632
UPDATE cases c
SET id_number = 'OB00613632'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JACQUEMART KONZOLI MBIATO'))
  AND c.id_number IS NULL;

-- KCS530 | LERATO ANACLADER MABILO | 9911250512083
UPDATE cases c
SET id_number = '9911250512083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LERATO ANACLADER MABILO'))
  AND c.id_number IS NULL;

-- KC532 | MUSAWENKOSI MTHEMBU | 9710305901089
UPDATE cases c
SET id_number = '9710305901089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MUSAWENKOSI MTHEMBU'))
  AND c.id_number IS NULL;

-- KCS533 | ANNA MARIA DASILVA | 6505230110084
UPDATE cases c
SET id_number = '6505230110084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANNA MARIA DASILVA'))
  AND c.id_number IS NULL;

-- KCS534 | ISAAC THABANG HOPANE | 9409206083085
UPDATE cases c
SET id_number = '9409206083085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ISAAC THABANG HOPANE'))
  AND c.id_number IS NULL;

-- KCS535 | NOKWANDA LAUREN PHEWA | 8202111090084
UPDATE cases c
SET id_number = '8202111090084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOKWANDA LAUREN PHEWA'))
  AND c.id_number IS NULL;

-- KCS537 | MIKE CHAMBOKO MUBATAPASANGO | EN576805
UPDATE cases c
SET id_number = 'EN576805'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MIKE CHAMBOKO MUBATAPASANGO'))
  AND c.id_number IS NULL;

-- KCS539 | LUSANDA ZINGITHWA | 8706240854087
UPDATE cases c
SET id_number = '8706240854087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUSANDA ZINGITHWA'))
  AND c.id_number IS NULL;

-- KCS541 | PRECIOUS PRETTY NKUMANE | 0110280361087
UPDATE cases c
SET id_number = '0110280361087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PRECIOUS PRETTY NKUMANE'))
  AND c.id_number IS NULL;

-- KCS542 | MZWANDILE WISEMAN ZWANE | 8506155710088
UPDATE cases c
SET id_number = '8506155710088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZWANDILE WISEMAN ZWANE'))
  AND c.id_number IS NULL;

-- KCS543 | ERNEST LESLY BOTHA | 9202235114082
UPDATE cases c
SET id_number = '9202235114082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ERNEST LESLY BOTHA'))
  AND c.id_number IS NULL;

-- KCS545 | ADAM MUDAWO | PTAZWE07650829
UPDATE cases c
SET id_number = 'PTAZWE07650829'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ADAM MUDAWO'))
  AND c.id_number IS NULL;

-- KCS546 | MASHAOLE SOLOMON MOTOA | 8002245337082
UPDATE cases c
SET id_number = '8002245337082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MASHAOLE SOLOMON MOTOA'))
  AND c.id_number IS NULL;

-- KCS547 | PAPIKIE PHILLIP MESHISHIBE | 6802255506084
UPDATE cases c
SET id_number = '6802255506084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PAPIKIE PHILLIP MESHISHIBE'))
  AND c.id_number IS NULL;

-- KCS549 | DONOVAN DIAS COETSER OBO DYLAN COETSER | 9008085021081
UPDATE cases c
SET id_number = '9008085021081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DONOVAN DIAS COETSER OBO DYLAN COETSER'))
  AND c.id_number IS NULL;

-- KCS550 | SIPHELELE CONSTANCE LUTHULI OBO BUHLE MANDLENKOSI MATHAPUNA | 8903101262084
UPDATE cases c
SET id_number = '8903101262084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHELELE CONSTANCE LUTHULI OBO BUHLE MANDLENKOSI MATHAPUNA'))
  AND c.id_number IS NULL;

-- KCS551 | NTOMBIZODWA CYNTHIA MDIMA | 7804270781089
UPDATE cases c
SET id_number = '7804270781089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTOMBIZODWA CYNTHIA MDIMA'))
  AND c.id_number IS NULL;

-- KCS553 | SORETTE CILLIERS | 7905170055084
UPDATE cases c
SET id_number = '7905170055084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SORETTE CILLIERS'))
  AND c.id_number IS NULL;

-- KCS554 | JACOB TSHIMBU OBO ELIE TSHIMBU | PTACOD001410512
UPDATE cases c
SET id_number = 'PTACOD001410512'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JACOB TSHIMBU OBO ELIE TSHIMBU'))
  AND c.id_number IS NULL;

-- KCS555 | SORETTE CILLIERS OBO ADEN NEAL OLIVIER | 0810015400080
UPDATE cases c
SET id_number = '0810015400080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SORETTE CILLIERS OBO ADEN NEAL OLIVIER'))
  AND c.id_number IS NULL;

-- KCS557 | CARMIN OLIVIER | 040320 0172 084
UPDATE cases c
SET id_number = '040320 0172 084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CARMIN OLIVIER'))
  AND c.id_number IS NULL;

-- KCS567 | MOLEBOHENG KHASAPANE | 9509090888083
UPDATE cases c
SET id_number = '9509090888083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLEBOHENG KHASAPANE'))
  AND c.id_number IS NULL;

-- KCS569 | JEFFREY CHRIS MAHLANGU | 9412225622081
UPDATE cases c
SET id_number = '9412225622081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JEFFREY CHRIS MAHLANGU'))
  AND c.id_number IS NULL;

-- KCS571 | AUSTIN VANDU | ptazwe005470511
UPDATE cases c
SET id_number = 'ptazwe005470511'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AUSTIN VANDU'))
  AND c.id_number IS NULL;

-- KCS573 | NASH GAINON THOMPSON | '9007075071080
UPDATE cases c
SET id_number = '''9007075071080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NASH GAINON THOMPSON'))
  AND c.id_number IS NULL;

-- KCS575 | JOHANNES BODIRWA | 9711256197081
UPDATE cases c
SET id_number = '9711256197081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNES BODIRWA'))
  AND c.id_number IS NULL;

-- KCS577 | ELISA TSHABANG MOTHOASAE | 8310060789083
UPDATE cases c
SET id_number = '8310060789083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELISA TSHABANG MOTHOASAE'))
  AND c.id_number IS NULL;

-- KCS579 | MPANDA FILS EMERY | MUSCOD001350313
UPDATE cases c
SET id_number = 'MUSCOD001350313'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPANDA FILS EMERY'))
  AND c.id_number IS NULL;

-- KCS581 | YACOUBA COULIBALY | 5904205307083
UPDATE cases c
SET id_number = '5904205307083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('YACOUBA COULIBALY'))
  AND c.id_number IS NULL;

-- KCS582 | DAVID MATSOBANE APHANE | 7004135459087
UPDATE cases c
SET id_number = '7004135459087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID MATSOBANE APHANE'))
  AND c.id_number IS NULL;

-- KCS583 | SUNNYBOY MOTSAMAI | 9908200901085
UPDATE cases c
SET id_number = '9908200901085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUNNYBOY MOTSAMAI'))
  AND c.id_number IS NULL;

-- KCS585 | SIBONGILE MAKUKULE | 9110130195082
UPDATE cases c
SET id_number = '9110130195082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIBONGILE MAKUKULE'))
  AND c.id_number IS NULL;

-- KCS586 | ANDREW PUKUTA | BN396301
UPDATE cases c
SET id_number = 'BN396301'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDREW PUKUTA'))
  AND c.id_number IS NULL;

-- KCS587 | LEHLOHONOLO MOTLOUNG | 8504125934086
UPDATE cases c
SET id_number = '8504125934086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LEHLOHONOLO MOTLOUNG'))
  AND c.id_number IS NULL;

-- KCS588 | RYNO VAN HEERDEN | 8512135064083
UPDATE cases c
SET id_number = '8512135064083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RYNO VAN HEERDEN'))
  AND c.id_number IS NULL;

-- KC589 | FREDRICKA COETZEE | 7309010036083
UPDATE cases c
SET id_number = '7309010036083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FREDRICKA COETZEE'))
  AND c.id_number IS NULL;

-- KC590 | WILLIAM BOESMAN MASANABO | 7102036367081
UPDATE cases c
SET id_number = '7102036367081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLIAM BOESMAN MASANABO'))
  AND c.id_number IS NULL;

-- KC592 | SUZAN DIEKETSENG MOCHELANYANA | 7905040806088
UPDATE cases c
SET id_number = '7905040806088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUZAN DIEKETSENG MOCHELANYANA'))
  AND c.id_number IS NULL;

-- KCS595 | NOKUTHULA CEDILE | 9408110357080
UPDATE cases c
SET id_number = '9408110357080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOKUTHULA CEDILE'))
  AND c.id_number IS NULL;

-- KCS596 | DANIEL RUDOLF PIETER PRETORIUS | 9210055146084
UPDATE cases c
SET id_number = '9210055146084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DANIEL RUDOLF PIETER PRETORIUS'))
  AND c.id_number IS NULL;

-- KC597 | MULLER FOURIE | 06.07.2022
UPDATE cases c
SET id_number = '06.07.2022'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MULLER FOURIE'))
  AND c.id_number IS NULL;

-- KCS598 | SULENTE PRETORIUS | 8707150197087
UPDATE cases c
SET id_number = '8707150197087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SULENTE PRETORIUS'))
  AND c.id_number IS NULL;

-- KCS600 | KAYLEIGH PRETORIUS | 0601181547089
UPDATE cases c
SET id_number = '0601181547089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KAYLEIGH PRETORIUS'))
  AND c.id_number IS NULL;

-- KCS602 | DANIEL PRETORIUS OBO RENES-MAY | 9210055146084
UPDATE cases c
SET id_number = '9210055146084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DANIEL PRETORIUS OBO RENES-MAY'))
  AND c.id_number IS NULL;

-- KCS603 | JUANDRE LUIZ | 0103065230080
UPDATE cases c
SET id_number = '0103065230080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JUANDRE LUIZ'))
  AND c.id_number IS NULL;

-- KCS604 | SULENTE PRETORIUS OBO RUHANDO | 1812095784085
UPDATE cases c
SET id_number = '1812095784085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SULENTE PRETORIUS OBO RUHANDO'))
  AND c.id_number IS NULL;

-- KC605 | WILLEM REDELINGHUYS | 6303055048088
UPDATE cases c
SET id_number = '6303055048088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLEM REDELINGHUYS'))
  AND c.id_number IS NULL;

-- KC606 | GOODNESS THULE SITHOLE | 8604050250084
UPDATE cases c
SET id_number = '8604050250084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GOODNESS THULE SITHOLE'))
  AND c.id_number IS NULL;

-- KCS607 | GENIESE PIETERS | 9707020011087
UPDATE cases c
SET id_number = '9707020011087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GENIESE PIETERS'))
  AND c.id_number IS NULL;

-- KC608 | PATIENCE MAHLANGU OBO GIVEN | 8606250242084
UPDATE cases c
SET id_number = '8606250242084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PATIENCE MAHLANGU OBO GIVEN'))
  AND c.id_number IS NULL;

-- KCS609 | LOUISA L MAPEA OBO KGOTSO J | 9102110655086
UPDATE cases c
SET id_number = '9102110655086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LOUISA L MAPEA OBO KGOTSO J'))
  AND c.id_number IS NULL;

-- KCS610 | WILSON MADIRA TSHITAMBA | 6812305739080
UPDATE cases c
SET id_number = '6812305739080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILSON MADIRA TSHITAMBA'))
  AND c.id_number IS NULL;

-- KCS611 | ORLANDO ALMEIDA SITOE | 20CC15206
UPDATE cases c
SET id_number = '20CC15206'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ORLANDO ALMEIDA SITOE'))
  AND c.id_number IS NULL;

-- KC612 | BOITUMELO MALEKANE MOGASWANA | 8603076075087
UPDATE cases c
SET id_number = '8603076075087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOITUMELO MALEKANE MOGASWANA'))
  AND c.id_number IS NULL;

-- KCS613 | AFONSO LUIS ZAUEU CHONGO | AB1062091
UPDATE cases c
SET id_number = 'AB1062091'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AFONSO LUIS ZAUEU CHONGO'))
  AND c.id_number IS NULL;

-- KCS615 | AZEVEDO MASSEMA | PTAMOZ005465088
UPDATE cases c
SET id_number = 'PTAMOZ005465088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AZEVEDO MASSEMA'))
  AND c.id_number IS NULL;

-- KCS616 | RENIER BOTHA | 9901185048089
UPDATE cases c
SET id_number = '9901185048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RENIER BOTHA'))
  AND c.id_number IS NULL;

-- KCS617 | JULIO MONDLANE | AB0985415
UPDATE cases c
SET id_number = 'AB0985415'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JULIO MONDLANE'))
  AND c.id_number IS NULL;

-- KCS618 | JACOBUS CHRISTIAAN VAN SCHALKWYK | 8801095066083
UPDATE cases c
SET id_number = '8801095066083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JACOBUS CHRISTIAAN VAN SCHALKWYK'))
  AND c.id_number IS NULL;

-- KC619 | MADELENE GRUNDLINGH | 6611190041085
UPDATE cases c
SET id_number = '6611190041085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MADELENE GRUNDLINGH'))
  AND c.id_number IS NULL;

-- KCS620 | DALENE SMITH | 6906230017081
UPDATE cases c
SET id_number = '6906230017081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DALENE SMITH'))
  AND c.id_number IS NULL;

-- KCS621 | ARMANDO CARLOS BOCA | 7801016848180
UPDATE cases c
SET id_number = '7801016848180'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ARMANDO CARLOS BOCA'))
  AND c.id_number IS NULL;

-- KCS622 | WILNA VENTER | 5905290025084
UPDATE cases c
SET id_number = '5905290025084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILNA VENTER'))
  AND c.id_number IS NULL;

-- KCS623 | NONTLANTLA MBEDLASHE obo ANDIPHILE MBEDLASHE | 8410110782086 / 1311160888087
UPDATE cases c
SET id_number = '8410110782086 / 1311160888087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NONTLANTLA MBEDLASHE obo ANDIPHILE MBEDLASHE'))
  AND c.id_number IS NULL;

-- KCS625 | NOMSA NATHASI | 0211140244081
UPDATE cases c
SET id_number = '0211140244081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOMSA NATHASI'))
  AND c.id_number IS NULL;

-- KCS626 | CLEMENCE SAGOMBA | 02-2001223 S 70 CIT M
UPDATE cases c
SET id_number = '02-2001223 S 70 CIT M'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CLEMENCE SAGOMBA'))
  AND c.id_number IS NULL;

-- KCS628 | EMERLY DENHERE | AE010182
UPDATE cases c
SET id_number = 'AE010182'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EMERLY DENHERE'))
  AND c.id_number IS NULL;

-- KCS629 | KEALEBOGE ALICIA MATHLOKO | 0204210372080
UPDATE cases c
SET id_number = '0204210372080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEALEBOGE ALICIA MATHLOKO'))
  AND c.id_number IS NULL;

-- KCS630 | MXOLISI MIKE DUBE | 8505045898087
UPDATE cases c
SET id_number = '8505045898087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MXOLISI MIKE DUBE'))
  AND c.id_number IS NULL;

-- KCS632 | ALEX TAPFUMANYENI | DN793841
UPDATE cases c
SET id_number = 'DN793841'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALEX TAPFUMANYENI'))
  AND c.id_number IS NULL;

-- KCS633 | MZWANDILE WISEMAN HLONGWANE | 8903016114081
UPDATE cases c
SET id_number = '8903016114081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZWANDILE WISEMAN HLONGWANE'))
  AND c.id_number IS NULL;

-- KC634 | CONSTANCE NYAWANE | 8310030685080
UPDATE cases c
SET id_number = '8310030685080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CONSTANCE NYAWANE'))
  AND c.id_number IS NULL;

-- KCS635 | ALPHONCE MAWADZWANE | 12-159264 Q 12 CIT M
UPDATE cases c
SET id_number = '12-159264 Q 12 CIT M'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALPHONCE MAWADZWANE'))
  AND c.id_number IS NULL;

-- KCS636 | DENNIS KASANGO | ZP014262
UPDATE cases c
SET id_number = 'ZP014262'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DENNIS KASANGO'))
  AND c.id_number IS NULL;

-- KCS638 | FESTO SEBASTIAN MBUYA | AB809804
UPDATE cases c
SET id_number = 'AB809804'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FESTO SEBASTIAN MBUYA'))
  AND c.id_number IS NULL;

-- KCS639 | KHANYISA MNDAWO | 9502066358082
UPDATE cases c
SET id_number = '9502066358082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHANYISA MNDAWO'))
  AND c.id_number IS NULL;

-- KCS640 | VUSI GEORGE MAHLOMANZA | 8411035380089
UPDATE cases c
SET id_number = '8411035380089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUSI GEORGE MAHLOMANZA'))
  AND c.id_number IS NULL;

-- KC641 | JEREMIAS VAN PLETZEN | 6005055061082
UPDATE cases c
SET id_number = '6005055061082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JEREMIAS VAN PLETZEN'))
  AND c.id_number IS NULL;

-- KC642 | CHARLOTTE HUMAN | 871018001589
UPDATE cases c
SET id_number = '871018001589'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHARLOTTE HUMAN'))
  AND c.id_number IS NULL;

-- KCS643 | CINNAH MATHONSI | 7709100750081
UPDATE cases c
SET id_number = '7709100750081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CINNAH MATHONSI'))
  AND c.id_number IS NULL;

-- KC644 | BELASHEW TADESSA LEMMA | BRA/007562/3
UPDATE cases c
SET id_number = 'BRA/007562/3'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BELASHEW TADESSA LEMMA'))
  AND c.id_number IS NULL;

-- KC645 | MOUCHANE MEIER obo LILIAN FOURIE | 9301130150082
UPDATE cases c
SET id_number = '9301130150082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOUCHANE MEIER obo LILIAN FOURIE'))
  AND c.id_number IS NULL;

-- KCS646 | MARTHA ALETTA BORMAN | 6312090022081
UPDATE cases c
SET id_number = '6312090022081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARTHA ALETTA BORMAN'))
  AND c.id_number IS NULL;

-- KC647 | XOLANI MFAWAFUTUI MALINGA | 8402185787082
UPDATE cases c
SET id_number = '8402185787082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOLANI MFAWAFUTUI MALINGA'))
  AND c.id_number IS NULL;

-- KC648 | SARAH CHABALALA obo IPELENG ROSINAH | 810602 0680 085
UPDATE cases c
SET id_number = '810602 0680 085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SARAH CHABALALA obo IPELENG ROSINAH'))
  AND c.id_number IS NULL;

-- KCS649 | DAFRESS CHISI | WT732F1K
UPDATE cases c
SET id_number = 'WT732F1K'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAFRESS CHISI'))
  AND c.id_number IS NULL;

-- KC650 | THEMBA WALTER MASEMOLA | 8303305661084
UPDATE cases c
SET id_number = '8303305661084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THEMBA WALTER MASEMOLA'))
  AND c.id_number IS NULL;

-- KCS651 | ALBERT BANDA | MA296073
UPDATE cases c
SET id_number = 'MA296073'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALBERT BANDA'))
  AND c.id_number IS NULL;

-- KC652 | MADUME ELIZABETH SHAKU | 6906090761084
UPDATE cases c
SET id_number = '6906090761084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MADUME ELIZABETH SHAKU'))
  AND c.id_number IS NULL;

-- KCS653 | LBJ STIELER | 7110045263084
UPDATE cases c
SET id_number = '7110045263084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LBJ STIELER'))
  AND c.id_number IS NULL;

-- KC654 | TEBOGO AGREEMENT KOMANE | 0204085961082
UPDATE cases c
SET id_number = '0204085961082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TEBOGO AGREEMENT KOMANE'))
  AND c.id_number IS NULL;

-- KCS655 | SAMOEL MKHANZI | PTAMOZ003780715
UPDATE cases c
SET id_number = 'PTAMOZ003780715'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAMOEL MKHANZI'))
  AND c.id_number IS NULL;

-- KC656 | GERHARDUS CORNELIUS FOURIE | 9006155124082
UPDATE cases c
SET id_number = '9006155124082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GERHARDUS CORNELIUS FOURIE'))
  AND c.id_number IS NULL;

-- KCS657 | THABO MHLUNGU | 8410075607088
UPDATE cases c
SET id_number = '8410075607088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO MHLUNGU'))
  AND c.id_number IS NULL;

-- KC658 | CHRISTIAN BARTHO LOMBARD | 8901315048083
UPDATE cases c
SET id_number = '8901315048083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTIAN BARTHO LOMBARD'))
  AND c.id_number IS NULL;

-- KCS659 | VSN MANGCIPHU | 2012100438084
UPDATE cases c
SET id_number = '2012100438084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VSN MANGCIPHU'))
  AND c.id_number IS NULL;

-- KCS661 | SIPHIWE NKOSIYAZI DLADLA | 8506056061086
UPDATE cases c
SET id_number = '8506056061086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHIWE NKOSIYAZI DLADLA'))
  AND c.id_number IS NULL;

-- KCS662 | MARIUS ALBERT VIVIERS | 6703155030086
UPDATE cases c
SET id_number = '6703155030086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARIUS ALBERT VIVIERS'))
  AND c.id_number IS NULL;

-- KC663 | MARY JANE MATJILA | 8412201055083
UPDATE cases c
SET id_number = '8412201055083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARY JANE MATJILA'))
  AND c.id_number IS NULL;

-- KCS665 | GODFREY SAHUMANI | DN712913
UPDATE cases c
SET id_number = 'DN712913'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GODFREY SAHUMANI'))
  AND c.id_number IS NULL;

-- KC666 | THABO EUGENE MOGANE | 9203155313084
UPDATE cases c
SET id_number = '9203155313084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO EUGENE MOGANE'))
  AND c.id_number IS NULL;

-- KCS667 | BENNETH MANDANI ZITHA | 7505036232081
UPDATE cases c
SET id_number = '7505036232081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BENNETH MANDANI ZITHA'))
  AND c.id_number IS NULL;

-- KCS668 | RODRIC BAGUMA KANUHANDA | PTACOD000290722
UPDATE cases c
SET id_number = 'PTACOD000290722'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RODRIC BAGUMA KANUHANDA'))
  AND c.id_number IS NULL;

-- KCS669 | ELSIE NTULI obo 3 MINORS | 8204020718086
UPDATE cases c
SET id_number = '8204020718086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELSIE NTULI obo 3 MINORS'))
  AND c.id_number IS NULL;

-- KCS670 | MORRIS DAVES SANHEWE | FN890911
UPDATE cases c
SET id_number = 'FN890911'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MORRIS DAVES SANHEWE'))
  AND c.id_number IS NULL;

-- KCS672 | VUYO NOMNGANA | 8404016225084
UPDATE cases c
SET id_number = '8404016225084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUYO NOMNGANA'))
  AND c.id_number IS NULL;

-- KC673 | NONHLE MTSELEKU | 9303040491085
UPDATE cases c
SET id_number = '9303040491085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NONHLE MTSELEKU'))
  AND c.id_number IS NULL;

-- KCS674 | EMILY MOLOGETSO obo NTHABELENG | 0606110921081
UPDATE cases c
SET id_number = '0606110921081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EMILY MOLOGETSO obo NTHABELENG'))
  AND c.id_number IS NULL;

-- KCS676 | JOHANNES MAHLANGA | 8403136008081
UPDATE cases c
SET id_number = '8403136008081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNES MAHLANGA'))
  AND c.id_number IS NULL;

-- KCS677 | PINKY NTAMBO | 9202021573087
UPDATE cases c
SET id_number = '9202021573087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PINKY NTAMBO'))
  AND c.id_number IS NULL;

-- KCS678 | LUKE GEOFFREY GUEST | 6405135085087
UPDATE cases c
SET id_number = '6405135085087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUKE GEOFFREY GUEST'))
  AND c.id_number IS NULL;

-- KCS679 | ISTIHAQ LATHIFF | 980530 5087 085
UPDATE cases c
SET id_number = '980530 5087 085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ISTIHAQ LATHIFF'))
  AND c.id_number IS NULL;

-- KCS680 | NTHANDO LUCKY NKOSI | 9312075129080
UPDATE cases c
SET id_number = '9312075129080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTHANDO LUCKY NKOSI'))
  AND c.id_number IS NULL;

-- KCS682 | NTUMELENG SANETTE SINGO | 9812010521085
UPDATE cases c
SET id_number = '9812010521085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTUMELENG SANETTE SINGO'))
  AND c.id_number IS NULL;

-- KCS683 | XIKOMBISO CLERIL MATHONSI | 0205301329087
UPDATE cases c
SET id_number = '0205301329087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XIKOMBISO CLERIL MATHONSI'))
  AND c.id_number IS NULL;

-- KCS684 | SALOME SHAE | 5906250624088
UPDATE cases c
SET id_number = '5906250624088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SALOME SHAE'))
  AND c.id_number IS NULL;

-- KCS685 | CINNAH MATHONSI obo VUN'WE CLARITY MATHONSI | 7709100750081
UPDATE cases c
SET id_number = '7709100750081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CINNAH MATHONSI obo VUN''WE CLARITY MATHONSI'))
  AND c.id_number IS NULL;

-- KCS686 | ISAAC SHAE | 0004015232087
UPDATE cases c
SET id_number = '0004015232087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ISAAC SHAE'))
  AND c.id_number IS NULL;

-- KCS687 | DONALD ANDREW NGAMBI | MA905655
UPDATE cases c
SET id_number = 'MA905655'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DONALD ANDREW NGAMBI'))
  AND c.id_number IS NULL;

-- KCS688 | MAGOBANE SHAE | 0501060764088
UPDATE cases c
SET id_number = '0501060764088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MAGOBANE SHAE'))
  AND c.id_number IS NULL;

-- KCS689 | BW MDLALOSE obo NBK MATYEKA | 9004060601088
UPDATE cases c
SET id_number = '9004060601088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BW MDLALOSE obo NBK MATYEKA'))
  AND c.id_number IS NULL;

-- KCS691 | SELLWANE EMILY KOETLE | 8206080753085
UPDATE cases c
SET id_number = '8206080753085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SELLWANE EMILY KOETLE'))
  AND c.id_number IS NULL;

-- KCS692 | SIKHANYISO NDLOVU | EN782841
UPDATE cases c
SET id_number = 'EN782841'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIKHANYISO NDLOVU'))
  AND c.id_number IS NULL;

-- KC693 | FERDINAND PETRUS PIETERSE | 7008315261087
UPDATE cases c
SET id_number = '7008315261087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FERDINAND PETRUS PIETERSE'))
  AND c.id_number IS NULL;

-- KCS694 | MARTHA NGOBENI obo T | 9211090739081
UPDATE cases c
SET id_number = '9211090739081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARTHA NGOBENI obo T'))
  AND c.id_number IS NULL;

-- KCS695 | JERRY JINKO MAKUA | 9011155604083
UPDATE cases c
SET id_number = '9011155604083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JERRY JINKO MAKUA'))
  AND c.id_number IS NULL;

-- KCS696 | LUYANDA HOPEWELL ZUKE | 0303066474089
UPDATE cases c
SET id_number = '0303066474089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUYANDA HOPEWELL ZUKE'))
  AND c.id_number IS NULL;

-- KCS697 | GRAMMA BALOYI | 6709150112084
UPDATE cases c
SET id_number = '6709150112084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GRAMMA BALOYI'))
  AND c.id_number IS NULL;

-- KCS698 | WHITE MDALA | MA508953
UPDATE cases c
SET id_number = 'MA508953'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WHITE MDALA'))
  AND c.id_number IS NULL;

-- KCS699 | ILZE COETZEE | 7705260120081
UPDATE cases c
SET id_number = '7705260120081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ILZE COETZEE'))
  AND c.id_number IS NULL;

-- KCS700 | JEAN DE DIEU BUKURU | OP0102510
UPDATE cases c
SET id_number = 'OP0102510'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JEAN DE DIEU BUKURU'))
  AND c.id_number IS NULL;

-- KCS702 | AARON MDUDUSI XABA | 8003225250089
UPDATE cases c
SET id_number = '8003225250089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AARON MDUDUSI XABA'))
  AND c.id_number IS NULL;

-- KCS703 | FAITH PUSELETSO NZAMA | 9805310629087
UPDATE cases c
SET id_number = '9805310629087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FAITH PUSELETSO NZAMA'))
  AND c.id_number IS NULL;

-- KCS704 | SIYANDA SINQOBILE GCUENSA | 8907075727089
UPDATE cases c
SET id_number = '8907075727089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIYANDA SINQOBILE GCUENSA'))
  AND c.id_number IS NULL;

-- KCK705 | GM STRYDOM obo JD KITCHING | 7903115015081
UPDATE cases c
SET id_number = '7903115015081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GM STRYDOM obo JD KITCHING'))
  AND c.id_number IS NULL;

-- KCS706 | MOLHOKOA MATANIEL KGOBE | 6703155030086
UPDATE cases c
SET id_number = '6703155030086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLHOKOA MATANIEL KGOBE'))
  AND c.id_number IS NULL;

-- KC707 | HEINE JOHAN SENEKAL | 6302145190082
UPDATE cases c
SET id_number = '6302145190082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HEINE JOHAN SENEKAL'))
  AND c.id_number IS NULL;

-- KCS708 | VICTOR MOSES | PTAMWI905724169
UPDATE cases c
SET id_number = 'PTAMWI905724169'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VICTOR MOSES'))
  AND c.id_number IS NULL;

-- KCS709 | NKULULEKO MAUREEN VELANE | 0511270550086
UPDATE cases c
SET id_number = '0511270550086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKULULEKO MAUREEN VELANE'))
  AND c.id_number IS NULL;

-- KC710 | LAETITIA STEENKAMP | 9203180222086
UPDATE cases c
SET id_number = '9203180222086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LAETITIA STEENKAMP'))
  AND c.id_number IS NULL;

-- KC712 | BELINDA LAINE | 9503280013081
UPDATE cases c
SET id_number = '9503280013081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BELINDA LAINE'))
  AND c.id_number IS NULL;

-- KC714 | RICHARD MASHABA | 8408246243080
UPDATE cases c
SET id_number = '8408246243080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RICHARD MASHABA'))
  AND c.id_number IS NULL;

-- KC715 | ARMANDO LUBBE | 9803105108082
UPDATE cases c
SET id_number = '9803105108082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ARMANDO LUBBE'))
  AND c.id_number IS NULL;

-- KC716 | PRINCE MALAPILE | 8208025422081
UPDATE cases c
SET id_number = '8208025422081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PRINCE MALAPILE'))
  AND c.id_number IS NULL;

-- KC718 | OLIVIA LUVHENGO obo | 7305251080087
UPDATE cases c
SET id_number = '7305251080087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OLIVIA LUVHENGO obo'))
  AND c.id_number IS NULL;

-- KC719 | CHRIS VORSTER obo | 0608140109083
UPDATE cases c
SET id_number = '0608140109083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRIS VORSTER obo'))
  AND c.id_number IS NULL;

-- KC721 | CHARMIAN BESTER | 7212290163084
UPDATE cases c
SET id_number = '7212290163084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHARMIAN BESTER'))
  AND c.id_number IS NULL;

-- KC723 | HUGO BESTER | 6512205128083
UPDATE cases c
SET id_number = '6512205128083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HUGO BESTER'))
  AND c.id_number IS NULL;

-- KC725 | CHARMAINE BESTER obo WIMPY | 0707096532088
UPDATE cases c
SET id_number = '0707096532088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHARMAINE BESTER obo WIMPY'))
  AND c.id_number IS NULL;

-- KC727 | CHARMAIN BESTER obo MONRE | 0707096533088
UPDATE cases c
SET id_number = '0707096533088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHARMAIN BESTER obo MONRE'))
  AND c.id_number IS NULL;

-- KC728 | PETER MOTLALENTWA MASENYA | 900301 5867 083
UPDATE cases c
SET id_number = '900301 5867 083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PETER MOTLALENTWA MASENYA'))
  AND c.id_number IS NULL;

-- KCK729 | FRANCELLE DELPORT | 9602090040084
UPDATE cases c
SET id_number = '9602090040084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANCELLE DELPORT'))
  AND c.id_number IS NULL;

-- KC731 | SEGWATI DUFFY SERUMULA | 7212265933089
UPDATE cases c
SET id_number = '7212265933089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SEGWATI DUFFY SERUMULA'))
  AND c.id_number IS NULL;

-- KCR732 | DEBBIE NORTJE | 7709080208084
UPDATE cases c
SET id_number = '7709080208084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DEBBIE NORTJE'))
  AND c.id_number IS NULL;

-- KC733 | IVONNE MATLALA OBO | 8601310454084
UPDATE cases c
SET id_number = '8601310454084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('IVONNE MATLALA OBO'))
  AND c.id_number IS NULL;

-- KCS734 | PIETER ADRIAAN ROSSOUW | 6207145010083
UPDATE cases c
SET id_number = '6207145010083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PIETER ADRIAAN ROSSOUW'))
  AND c.id_number IS NULL;

-- KC735 | TIAAN BLIGNAUT | 8604095035086
UPDATE cases c
SET id_number = '8604095035086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TIAAN BLIGNAUT'))
  AND c.id_number IS NULL;

-- KC736 | CAROLINA STEPHANIE ENGELBRECHT obo ANDRI | 8006050010080
UPDATE cases c
SET id_number = '8006050010080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CAROLINA STEPHANIE ENGELBRECHT obo ANDRI'))
  AND c.id_number IS NULL;

-- KC737 | KEDILATILE LENAH MARATE | 6310160905086
UPDATE cases c
SET id_number = '6310160905086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEDILATILE LENAH MARATE'))
  AND c.id_number IS NULL;

-- KC738 | POUL PRINSLOO | 0303155178088
UPDATE cases c
SET id_number = '0303155178088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('POUL PRINSLOO'))
  AND c.id_number IS NULL;

-- KC739 | TSHEPO ERIC MARATE | 9004236010081
UPDATE cases c
SET id_number = '9004236010081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPO ERIC MARATE'))
  AND c.id_number IS NULL;

-- KC742 | Phathutshedzo Kingsley Rambau | 0006045542088
UPDATE cases c
SET id_number = '0006045542088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('Phathutshedzo Kingsley Rambau'))
  AND c.id_number IS NULL;

-- KC743 | Vasco Malene | 7003206227180
UPDATE cases c
SET id_number = '7003206227180'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('Vasco Malene'))
  AND c.id_number IS NULL;

-- KC744 | ANTHONY SPHIWE MOTAUNG | 8303096406087
UPDATE cases c
SET id_number = '8303096406087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANTHONY SPHIWE MOTAUNG'))
  AND c.id_number IS NULL;

-- KC745 | SELETAH NYATHI | 7401071106184
UPDATE cases c
SET id_number = '7401071106184'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SELETAH NYATHI'))
  AND c.id_number IS NULL;

-- KC746 | BERNARD HLAUDI | 7406235806082
UPDATE cases c
SET id_number = '7406235806082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BERNARD HLAUDI'))
  AND c.id_number IS NULL;

-- KC747 | BATISTA JOAQUIM MAHACHE 8 | AB1396959
UPDATE cases c
SET id_number = 'AB1396959'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BATISTA JOAQUIM MAHACHE 8'))
  AND c.id_number IS NULL;

-- KC748 | NKOSIYAYAZI MELANI | 8202225773088
UPDATE cases c
SET id_number = '8202225773088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKOSIYAYAZI MELANI'))
  AND c.id_number IS NULL;

-- KC749 | ISAAC MOKOENA | 7401095389089
UPDATE cases c
SET id_number = '7401095389089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ISAAC MOKOENA'))
  AND c.id_number IS NULL;

-- KC750 | KGOMOTSO PRETRONELLA MASINA OBO OWEDITSE MASINA | 8110230786088
UPDATE cases c
SET id_number = '8110230786088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KGOMOTSO PRETRONELLA MASINA OBO OWEDITSE MASINA'))
  AND c.id_number IS NULL;

-- KC752 | ITUMELENG STEPHEN MOTLOGELWA | 7610266468080
UPDATE cases c
SET id_number = '7610266468080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ITUMELENG STEPHEN MOTLOGELWA'))
  AND c.id_number IS NULL;

-- KC753 | NOKUTHUKA CEDILE | 9408110357080
UPDATE cases c
SET id_number = '9408110357080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOKUTHUKA CEDILE'))
  AND c.id_number IS NULL;

-- KC755 | NOKUTHULA CEDILE OBO NDLAMO CEDILE | 9408110357080
UPDATE cases c
SET id_number = '9408110357080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOKUTHULA CEDILE OBO NDLAMO CEDILE'))
  AND c.id_number IS NULL;

-- KC757 | BADISA ERIC MABOGOLA | 7812225654087
UPDATE cases c
SET id_number = '7812225654087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BADISA ERIC MABOGOLA'))
  AND c.id_number IS NULL;

-- KC758 | THOBILE B GINA | 8801131018080
UPDATE cases c
SET id_number = '8801131018080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOBILE B GINA'))
  AND c.id_number IS NULL;

-- KC759 | THABANG KENNETH MOSIMA | 9012226041081
UPDATE cases c
SET id_number = '9012226041081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG KENNETH MOSIMA'))
  AND c.id_number IS NULL;

-- KC761 | TANKISO CYPRIAN MOSIA | 6703035279085
UPDATE cases c
SET id_number = '6703035279085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TANKISO CYPRIAN MOSIA'))
  AND c.id_number IS NULL;

-- KC762 | ABEL PULE | 8808105707085
UPDATE cases c
SET id_number = '8808105707085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ABEL PULE'))
  AND c.id_number IS NULL;

-- KC766 | ARTIMIZA AMERICO NCHACHENGO | AB0702866
UPDATE cases c
SET id_number = 'AB0702866'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ARTIMIZA AMERICO NCHACHENGO'))
  AND c.id_number IS NULL;

-- KCK767 | ANDREW MALATSI TSELE | 8010205380083
UPDATE cases c
SET id_number = '8010205380083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDREW MALATSI TSELE'))
  AND c.id_number IS NULL;

-- KC768 | CARLOS UATSA BOA | 15AN57252
UPDATE cases c
SET id_number = '15AN57252'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CARLOS UATSA BOA'))
  AND c.id_number IS NULL;

-- KC772 | REFILOE ESTER MBALA | 0206081160080
UPDATE cases c
SET id_number = '0206081160080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('REFILOE ESTER MBALA'))
  AND c.id_number IS NULL;

-- KC773 | BERNARDO ANTONIO NZUVANE | 7701135770184
UPDATE cases c
SET id_number = '7701135770184'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BERNARDO ANTONIO NZUVANE'))
  AND c.id_number IS NULL;

-- KC774 | ESTHER NONHLANHLA JELE | 7808120256085
UPDATE cases c
SET id_number = '7808120256085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ESTHER NONHLANHLA JELE'))
  AND c.id_number IS NULL;

-- KC776 | ESONA NOLWASI MTIMBE | 9511050347084
UPDATE cases c
SET id_number = '9511050347084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ESONA NOLWASI MTIMBE'))
  AND c.id_number IS NULL;

-- KC777 | XOLA KAKAZA | 9310110118084
UPDATE cases c
SET id_number = '9310110118084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOLA KAKAZA'))
  AND c.id_number IS NULL;

-- KC778 | SAMUEL PAUO COSSA | AB1155168
UPDATE cases c
SET id_number = 'AB1155168'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAMUEL PAUO COSSA'))
  AND c.id_number IS NULL;

-- KC780 | EPIPHAMUS SANDAOKAHLE ZULU | 8712045723089
UPDATE cases c
SET id_number = '8712045723089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EPIPHAMUS SANDAOKAHLE ZULU'))
  AND c.id_number IS NULL;

-- KC782 | SINAZO ROZANA | 9409191258080
UPDATE cases c
SET id_number = '9409191258080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SINAZO ROZANA'))
  AND c.id_number IS NULL;

-- KC783 | KGOMOTSO K MOLOTSI 6.5 | 6701035942082
UPDATE cases c
SET id_number = '6701035942082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KGOMOTSO K MOLOTSI 6.5'))
  AND c.id_number IS NULL;

-- KCK785 | MOLEBA LESANG MINA obo | 8808270347089
UPDATE cases c
SET id_number = '8808270347089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLEBA LESANG MINA obo'))
  AND c.id_number IS NULL;

-- KC786 | NKOSINATHI GOODWILL MAJOLA | 7908315369089
UPDATE cases c
SET id_number = '7908315369089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKOSINATHI GOODWILL MAJOLA'))
  AND c.id_number IS NULL;

-- KC787 | MADELENE GRUNDLINGH | 6611190041085
UPDATE cases c
SET id_number = '6611190041085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MADELENE GRUNDLINGH'))
  AND c.id_number IS NULL;

-- KC788 | CARLITOS CANDIDO MACHUNGO | AB1175002
UPDATE cases c
SET id_number = 'AB1175002'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CARLITOS CANDIDO MACHUNGO'))
  AND c.id_number IS NULL;

-- KC789 | ABSOLOM SIMPHIWE ZONDO | 9211165373089
UPDATE cases c
SET id_number = '9211165373089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ABSOLOM SIMPHIWE ZONDO'))
  AND c.id_number IS NULL;

-- KC790 | MPHO MABOA | 8604235781086
UPDATE cases c
SET id_number = '8604235781086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPHO MABOA'))
  AND c.id_number IS NULL;

-- KC791 | KGOPISUI SAMUEL MASHISHI | 7502105948085
UPDATE cases c
SET id_number = '7502105948085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KGOPISUI SAMUEL MASHISHI'))
  AND c.id_number IS NULL;

-- KC792 | MTHLOTI GERALD CHAUKE | 7705095354087
UPDATE cases c
SET id_number = '7705095354087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MTHLOTI GERALD CHAUKE'))
  AND c.id_number IS NULL;

-- KC793 | NGUME PHUTHUMA | 9312231231085
UPDATE cases c
SET id_number = '9312231231085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NGUME PHUTHUMA'))
  AND c.id_number IS NULL;

-- KC794 | TRACY NDEBELE | EN366540
UPDATE cases c
SET id_number = 'EN366540'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TRACY NDEBELE'))
  AND c.id_number IS NULL;

-- KC795 | FRIEDA MASEGO MATROOS | 8401220372082
UPDATE cases c
SET id_number = '8401220372082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRIEDA MASEGO MATROOS'))
  AND c.id_number IS NULL;

-- KC796 | LEBO NGUBANE | 8706036066086
UPDATE cases c
SET id_number = '8706036066086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LEBO NGUBANE'))
  AND c.id_number IS NULL;

-- KC797 | PHUMELO MATROOS | 8401220372082
UPDATE cases c
SET id_number = '8401220372082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHUMELO MATROOS'))
  AND c.id_number IS NULL;

-- KC798 | PHELIWE MAJOVA | 9202191289084
UPDATE cases c
SET id_number = '9202191289084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHELIWE MAJOVA'))
  AND c.id_number IS NULL;

-- KC799 | PHINDILE SHONGWE | 8105250443081
UPDATE cases c
SET id_number = '8105250443081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHINDILE SHONGWE'))
  AND c.id_number IS NULL;

-- KC801 | NONZAME JOJA | 8506090969088
UPDATE cases c
SET id_number = '8506090969088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NONZAME JOJA'))
  AND c.id_number IS NULL;

-- KC802 | MOHEBOGENG MAJOVA | 9202191289084
UPDATE cases c
SET id_number = '9202191289084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOHEBOGENG MAJOVA'))
  AND c.id_number IS NULL;

-- KC803 | MLUNGISI MTHEMBU | 9012276264088
UPDATE cases c
SET id_number = '9012276264088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MLUNGISI MTHEMBU'))
  AND c.id_number IS NULL;

-- KCK805 | EDWARD MATSI | 780302 6398 081
UPDATE cases c
SET id_number = '780302 6398 081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EDWARD MATSI'))
  AND c.id_number IS NULL;

-- KC806 | THEBELANI XULU | 8909296675089
UPDATE cases c
SET id_number = '8909296675089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THEBELANI XULU'))
  AND c.id_number IS NULL;

-- KC807 | TSHEPISO MARIA MOHALE | 9008310341080
UPDATE cases c
SET id_number = '9008310341080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPISO MARIA MOHALE'))
  AND c.id_number IS NULL;

-- KC808 | SOLLY STEPHEN MAJA | 7205225947082
UPDATE cases c
SET id_number = '7205225947082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SOLLY STEPHEN MAJA'))
  AND c.id_number IS NULL;

-- KC809 | SALOMAO MASSANGO | AB2745383
UPDATE cases c
SET id_number = 'AB2745383'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SALOMAO MASSANGO'))
  AND c.id_number IS NULL;

-- KC810 | AGNES MAMOTLOTLO NGWENYA | 8509092332081
UPDATE cases c
SET id_number = '8509092332081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AGNES MAMOTLOTLO NGWENYA'))
  AND c.id_number IS NULL;

-- KC812 | SISONE MQOLOMBENI | 9804111133084
UPDATE cases c
SET id_number = '9804111133084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SISONE MQOLOMBENI'))
  AND c.id_number IS NULL;

-- KC814 | BONGEKILE MADELA obo S | 0602085817081
UPDATE cases c
SET id_number = '0602085817081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONGEKILE MADELA obo S'))
  AND c.id_number IS NULL;

-- KC815 | HONEST OLETHU MBOBHI | 0104135745081
UPDATE cases c
SET id_number = '0104135745081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HONEST OLETHU MBOBHI'))
  AND c.id_number IS NULL;

-- KC816 | NOMSA PATIENCE MBATHA | 8109131199086
UPDATE cases c
SET id_number = '8109131199086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOMSA PATIENCE MBATHA'))
  AND c.id_number IS NULL;

-- KC817 | SANELE DYAYIYA | 0209145663081
UPDATE cases c
SET id_number = '0209145663081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SANELE DYAYIYA'))
  AND c.id_number IS NULL;

-- KCK819 | SINAZO GOMPO obo | 8806100879081
UPDATE cases c
SET id_number = '8806100879081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SINAZO GOMPO obo'))
  AND c.id_number IS NULL;

-- KCR820 | JOYCE MASEGO KHUBAI OBO NOTHLE GAID | 8204021421086
UPDATE cases c
SET id_number = '8204021421086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOYCE MASEGO KHUBAI OBO NOTHLE GAID'))
  AND c.id_number IS NULL;

-- KCK821 | REOTSHEPILE JOSEPHINE LEGODI obo | 6805080546084
UPDATE cases c
SET id_number = '6805080546084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('REOTSHEPILE JOSEPHINE LEGODI obo'))
  AND c.id_number IS NULL;

-- KC822 | PAULINA SELAHLA | 8810220666089
UPDATE cases c
SET id_number = '8810220666089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PAULINA SELAHLA'))
  AND c.id_number IS NULL;

-- KC823 | DAVID MUNTUWENKOSI THOMO | 6801016591088
UPDATE cases c
SET id_number = '6801016591088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID MUNTUWENKOSI THOMO'))
  AND c.id_number IS NULL;

-- KC824 | MAKWARELA NDITSHENI | 8804265743085
UPDATE cases c
SET id_number = '8804265743085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MAKWARELA NDITSHENI'))
  AND c.id_number IS NULL;

-- KC825 | MFANDLELA SAMUEL MOHUTSIWA | 8807275748085
UPDATE cases c
SET id_number = '8807275748085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MFANDLELA SAMUEL MOHUTSIWA'))
  AND c.id_number IS NULL;

-- KC826 | JOHANNES MOTAUNG | 8508215867080
UPDATE cases c
SET id_number = '8508215867080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNES MOTAUNG'))
  AND c.id_number IS NULL;

-- KC827 | BAVIKELELI INOCENT SOPHAZI | 941018 5203 082
UPDATE cases c
SET id_number = '941018 5203 082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BAVIKELELI INOCENT SOPHAZI'))
  AND c.id_number IS NULL;

-- KC828 | ORCIDIA CUMBANE | AB1338269
UPDATE cases c
SET id_number = 'AB1338269'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ORCIDIA CUMBANE'))
  AND c.id_number IS NULL;

-- KC829 | BRIAN NCUBE | AE803896
UPDATE cases c
SET id_number = 'AE803896'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BRIAN NCUBE'))
  AND c.id_number IS NULL;

-- KC830 | ORCIDIA CUMBANE obo MINOR | AB1338269
UPDATE cases c
SET id_number = 'AB1338269'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ORCIDIA CUMBANE obo MINOR'))
  AND c.id_number IS NULL;

-- KCK831 | GASENNELWE MODISANE | 9303261034085
UPDATE cases c
SET id_number = '9303261034085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GASENNELWE MODISANE'))
  AND c.id_number IS NULL;

-- KC832 | THANDOUWETHU DANDU | 9603125776080
UPDATE cases c
SET id_number = '9603125776080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDOUWETHU DANDU'))
  AND c.id_number IS NULL;

-- KC833 | OLEBOGENG MOSES G THEBE | 9410085324087
UPDATE cases c
SET id_number = '9410085324087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OLEBOGENG MOSES G THEBE'))
  AND c.id_number IS NULL;

-- KC834 | AYANA XAKAWE | 9204255223082
UPDATE cases c
SET id_number = '9204255223082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AYANA XAKAWE'))
  AND c.id_number IS NULL;

-- KC835 | KEVIN BREDENKAMP | 0003305176087
UPDATE cases c
SET id_number = '0003305176087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEVIN BREDENKAMP'))
  AND c.id_number IS NULL;

-- KC836 | KEMOLOPILE MONNANYANE | 9406215715087
UPDATE cases c
SET id_number = '9406215715087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEMOLOPILE MONNANYANE'))
  AND c.id_number IS NULL;

-- KC838 | ANDISWE ALINAH WALAZA | 7912090921080
UPDATE cases c
SET id_number = '7912090921080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDISWE ALINAH WALAZA'))
  AND c.id_number IS NULL;

-- KC839 | NTEFO MOSISINYANE | 9203020891082
UPDATE cases c
SET id_number = '9203020891082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTEFO MOSISINYANE'))
  AND c.id_number IS NULL;

-- KC840 | MPANGELE NGCOBO | 6504205883080
UPDATE cases c
SET id_number = '6504205883080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPANGELE NGCOBO'))
  AND c.id_number IS NULL;

-- KC842 | THOKOZILE MAKHOSAZANE NGCOBO | 6308250321081
UPDATE cases c
SET id_number = '6308250321081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOKOZILE MAKHOSAZANE NGCOBO'))
  AND c.id_number IS NULL;

-- KC843 | SANELE EXCELLENT MCHUNU | 8309166278080
UPDATE cases c
SET id_number = '8309166278080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SANELE EXCELLENT MCHUNU'))
  AND c.id_number IS NULL;

-- KC844 | MLUNGISI NTHANGASE | 9107255793089
UPDATE cases c
SET id_number = '9107255793089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MLUNGISI NTHANGASE'))
  AND c.id_number IS NULL;

-- KC845 | EMILY SEBOTHOMA | 7707270488086
UPDATE cases c
SET id_number = '7707270488086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EMILY SEBOTHOMA'))
  AND c.id_number IS NULL;

-- KC846 | MPOLAKENG LYDIA P MOFOKENG | 8212260701084
UPDATE cases c
SET id_number = '8212260701084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPOLAKENG LYDIA P MOFOKENG'))
  AND c.id_number IS NULL;

-- KC847 | VICTOR MTHANDENI NDLOVU | 6911305654081
UPDATE cases c
SET id_number = '6911305654081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VICTOR MTHANDENI NDLOVU'))
  AND c.id_number IS NULL;

-- KC848 | ERENST NOAH DITSEGO | 9405285947083
UPDATE cases c
SET id_number = '9405285947083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ERENST NOAH DITSEGO'))
  AND c.id_number IS NULL;

-- KC852 | NKULULEKO FAITH MATHEBULA | 9107090731088
UPDATE cases c
SET id_number = '9107090731088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKULULEKO FAITH MATHEBULA'))
  AND c.id_number IS NULL;

-- KC853 | CHRISTOPHER MOKOENA | 7410145462085
UPDATE cases c
SET id_number = '7410145462085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTOPHER MOKOENA'))
  AND c.id_number IS NULL;

-- KC854 | NTOKOZO MCHUNU | 950517 5836 088
UPDATE cases c
SET id_number = '950517 5836 088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTOKOZO MCHUNU'))
  AND c.id_number IS NULL;

-- KC855 | SAID HASHIM | MA490923
UPDATE cases c
SET id_number = 'MA490923'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAID HASHIM'))
  AND c.id_number IS NULL;

-- KC858 | YOLANDE KRUGER | 9602200153082
UPDATE cases c
SET id_number = '9602200153082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('YOLANDE KRUGER'))
  AND c.id_number IS NULL;

-- KC859 | OTHUSITSE WILLIAM PHETLHE | 880417 5650 081
UPDATE cases c
SET id_number = '880417 5650 081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OTHUSITSE WILLIAM PHETLHE'))
  AND c.id_number IS NULL;

-- KC860 | MABARENG JUSTINE NQHEKU obo | RC568609
UPDATE cases c
SET id_number = 'RC568609'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MABARENG JUSTINE NQHEKU obo'))
  AND c.id_number IS NULL;

-- KC861 | KUTLWANO ROBERT MENYAMA | '9901195426085
UPDATE cases c
SET id_number = '''9901195426085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KUTLWANO ROBERT MENYAMA'))
  AND c.id_number IS NULL;

-- KC862 | MANTSEBO AGNES NQHEKU | RC568609
UPDATE cases c
SET id_number = 'RC568609'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MANTSEBO AGNES NQHEKU'))
  AND c.id_number IS NULL;

-- KC863 | MOHAU VINGER | 9806035557082
UPDATE cases c
SET id_number = '9806035557082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOHAU VINGER'))
  AND c.id_number IS NULL;

-- KC864 | PINKY ESTHER MOKOENA | 7508030696087
UPDATE cases c
SET id_number = '7508030696087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PINKY ESTHER MOKOENA'))
  AND c.id_number IS NULL;

-- KC865 | CONROY THEODORE PORTER | 9212136063080
UPDATE cases c
SET id_number = '9212136063080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CONROY THEODORE PORTER'))
  AND c.id_number IS NULL;

-- KC866 | LUCAS CHAUKE | 9510215388082
UPDATE cases c
SET id_number = '9510215388082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUCAS CHAUKE'))
  AND c.id_number IS NULL;

-- KC867 | DIRK VAN DER BANK | 7511155026080
UPDATE cases c
SET id_number = '7511155026080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DIRK VAN DER BANK'))
  AND c.id_number IS NULL;

-- KC868 | FRANSINA OLYN | 7104210188085
UPDATE cases c
SET id_number = '7104210188085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANSINA OLYN'))
  AND c.id_number IS NULL;

-- KCK869 | THABISO DANIEL RAMKOMANE | 7905295761087
UPDATE cases c
SET id_number = '7905295761087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABISO DANIEL RAMKOMANE'))
  AND c.id_number IS NULL;

-- KC870 | FUMANI RICHMAN MKHAVELE | 8903025688083
UPDATE cases c
SET id_number = '8903025688083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FUMANI RICHMAN MKHAVELE'))
  AND c.id_number IS NULL;

-- KC871 | BOKANG ALPHONIAS LETHOLA | 0212155567085
UPDATE cases c
SET id_number = '0212155567085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOKANG ALPHONIAS LETHOLA'))
  AND c.id_number IS NULL;

-- KC872 | SHIRLEY NONHLANHLA MASEKO | 8707130309083
UPDATE cases c
SET id_number = '8707130309083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SHIRLEY NONHLANHLA MASEKO'))
  AND c.id_number IS NULL;

-- KC874 | NTUMISENG MOSES MOHAMME | 8912235206081
UPDATE cases c
SET id_number = '8912235206081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTUMISENG MOSES MOHAMME'))
  AND c.id_number IS NULL;

-- KC875 | MARY MOKGADI MACHABA obo BUANG GIVEN MACHABA | 7101051056082
UPDATE cases c
SET id_number = '7101051056082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARY MOKGADI MACHABA obo BUANG GIVEN MACHABA'))
  AND c.id_number IS NULL;

-- KC876 | MZIKAYISE ERIC NKGOENG | 8802215757080
UPDATE cases c
SET id_number = '8802215757080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZIKAYISE ERIC NKGOENG'))
  AND c.id_number IS NULL;

-- KC877 | MOSES XOLI BUTHELEZI | 9709266365086
UPDATE cases c
SET id_number = '9709266365086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOSES XOLI BUTHELEZI'))
  AND c.id_number IS NULL;

-- KC878 | THABO SELAHLE | 9210135614085
UPDATE cases c
SET id_number = '9210135614085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO SELAHLE'))
  AND c.id_number IS NULL;

-- KCK879 | MISHACK SHIMANTJE MOOS obo | 6604025866081
UPDATE cases c
SET id_number = '6604025866081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MISHACK SHIMANTJE MOOS obo'))
  AND c.id_number IS NULL;

-- KC880 | RAYMOND ZWANE | 8711176019085
UPDATE cases c
SET id_number = '8711176019085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RAYMOND ZWANE'))
  AND c.id_number IS NULL;

-- KC881 | ESMERALDA BROWERS obo | 9304150478086
UPDATE cases c
SET id_number = '9304150478086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ESMERALDA BROWERS obo'))
  AND c.id_number IS NULL;

-- KC882 | DAWID THEMBANI FAKU | 7601045396080
UPDATE cases c
SET id_number = '7601045396080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAWID THEMBANI FAKU'))
  AND c.id_number IS NULL;

-- KC883 | THANDIWE NOMPILO SOMAGACA | 0209200640081
UPDATE cases c
SET id_number = '0209200640081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDIWE NOMPILO SOMAGACA'))
  AND c.id_number IS NULL;

-- KC884 | MZOXOLO GADLU | 8908206101087
UPDATE cases c
SET id_number = '8908206101087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZOXOLO GADLU'))
  AND c.id_number IS NULL;

-- KC885 | BONTLE TLHOMELANG obo R | 9803130516089 AND1809120352086
UPDATE cases c
SET id_number = '9803130516089 AND1809120352086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONTLE TLHOMELANG obo R'))
  AND c.id_number IS NULL;

-- KC886 | TINYIKO VINCENT MALULEKE | 7506026247089
UPDATE cases c
SET id_number = '7506026247089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TINYIKO VINCENT MALULEKE'))
  AND c.id_number IS NULL;

-- KC887 | MASERAMA MERCIA ZULU | 9106080403088
UPDATE cases c
SET id_number = '9106080403088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MASERAMA MERCIA ZULU'))
  AND c.id_number IS NULL;

-- KC888 | SINAH NDLOVU | 7411300470087
UPDATE cases c
SET id_number = '7411300470087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SINAH NDLOVU'))
  AND c.id_number IS NULL;

-- KC889 | SUNDAY JULY MAKAMU | 9011186042089
UPDATE cases c
SET id_number = '9011186042089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUNDAY JULY MAKAMU'))
  AND c.id_number IS NULL;

-- KC890 | TSHEPO VICTOR PHATSOANE | 8508205963089
UPDATE cases c
SET id_number = '8508205963089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPO VICTOR PHATSOANE'))
  AND c.id_number IS NULL;

-- KC891 | SHALORD TSHOLOFO MABUE | 8911060352085
UPDATE cases c
SET id_number = '8911060352085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SHALORD TSHOLOFO MABUE'))
  AND c.id_number IS NULL;

-- KC892 | MUKHETHETWA RAPALALANI | 9305225450083
UPDATE cases c
SET id_number = '9305225450083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MUKHETHETWA RAPALALANI'))
  AND c.id_number IS NULL;

-- KC893 | THANDEKA JOHANNAH METHULA | 9004061193085
UPDATE cases c
SET id_number = '9004061193085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDEKA JOHANNAH METHULA'))
  AND c.id_number IS NULL;

-- KC894 | PROVIDENCE PHEELWANE | 8405210459080
UPDATE cases c
SET id_number = '8405210459080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PROVIDENCE PHEELWANE'))
  AND c.id_number IS NULL;

-- KC895 | LUCKY MAHLATJI NOKO | 9703256427089
UPDATE cases c
SET id_number = '9703256427089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUCKY MAHLATJI NOKO'))
  AND c.id_number IS NULL;

-- KC896 | ELIZABETH NKOSI | 6807260381084
UPDATE cases c
SET id_number = '6807260381084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZABETH NKOSI'))
  AND c.id_number IS NULL;

-- KC897 | NORMAN NTSHANE | 770527 5890 082
UPDATE cases c
SET id_number = '770527 5890 082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NORMAN NTSHANE'))
  AND c.id_number IS NULL;

-- KC898 | THABISO CLIFTON MONAMA | 9412125493088
UPDATE cases c
SET id_number = '9412125493088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABISO CLIFTON MONAMA'))
  AND c.id_number IS NULL;

-- KC899 | JAMES MASHIANE | 870220 5508 081
UPDATE cases c
SET id_number = '870220 5508 081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JAMES MASHIANE'))
  AND c.id_number IS NULL;

-- KC900 | SANDILE WONDER MANDLAZI | 9305235870080
UPDATE cases c
SET id_number = '9305235870080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SANDILE WONDER MANDLAZI'))
  AND c.id_number IS NULL;

-- KC901 | DUDUZILE ESTHER MTSHALI | 6810101380083
UPDATE cases c
SET id_number = '6810101380083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DUDUZILE ESTHER MTSHALI'))
  AND c.id_number IS NULL;

-- KC902 | SWEETNESS KGOMOTSO SINDANE | 7803250613080
UPDATE cases c
SET id_number = '7803250613080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SWEETNESS KGOMOTSO SINDANE'))
  AND c.id_number IS NULL;

-- KC903 | FUNOKWAKHE DERRICK KHUMALO | 8703066114084
UPDATE cases c
SET id_number = '8703066114084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FUNOKWAKHE DERRICK KHUMALO'))
  AND c.id_number IS NULL;

-- KC904 | SWEETNESS KGOMOTSO SINDANE obo LWASI LESEGO NJABULO MWALI | 7803250613080
UPDATE cases c
SET id_number = '7803250613080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SWEETNESS KGOMOTSO SINDANE obo LWASI LESEGO NJABULO MWALI'))
  AND c.id_number IS NULL;

-- KC905 | SIKHONZILE MELTA MTSHALI | 5704030487088
UPDATE cases c
SET id_number = '5704030487088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIKHONZILE MELTA MTSHALI'))
  AND c.id_number IS NULL;

-- KC906 | ITEBOHENG NOTHANDO MWALI | 0110300248082
UPDATE cases c
SET id_number = '0110300248082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ITEBOHENG NOTHANDO MWALI'))
  AND c.id_number IS NULL;

-- KC907 | SOPHI JETHA GABELA | 4802090563086
UPDATE cases c
SET id_number = '4802090563086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SOPHI JETHA GABELA'))
  AND c.id_number IS NULL;

-- KC908 | SAMANTHA MUNZHEDZI BUDELI | 0511260952086
UPDATE cases c
SET id_number = '0511260952086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAMANTHA MUNZHEDZI BUDELI'))
  AND c.id_number IS NULL;

-- KC909 | KC1018 | 9807235941084
UPDATE cases c
SET id_number = '9807235941084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KC1018'))
  AND c.id_number IS NULL;

-- KC910 | KHABO KELLINA DUBE obo UMINATHI LAKAJE | 7403090813089
UPDATE cases c
SET id_number = '7403090813089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHABO KELLINA DUBE obo UMINATHI LAKAJE'))
  AND c.id_number IS NULL;

-- KC911 | JAMES ERROL COETZEE | 6702135116080
UPDATE cases c
SET id_number = '6702135116080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JAMES ERROL COETZEE'))
  AND c.id_number IS NULL;

-- KC912 | TEBOGO LAZARUS MAMPANE | 9903205328087
UPDATE cases c
SET id_number = '9903205328087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TEBOGO LAZARUS MAMPANE'))
  AND c.id_number IS NULL;

-- KC913 | MUSA CLINTON TSHAKALA | 9308155975087
UPDATE cases c
SET id_number = '9308155975087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MUSA CLINTON TSHAKALA'))
  AND c.id_number IS NULL;

-- KC914 | TSEPO RAMOTHOPA | 9108085114082
UPDATE cases c
SET id_number = '9108085114082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSEPO RAMOTHOPA'))
  AND c.id_number IS NULL;

-- KC916 | LUCAS MANDLA MKHEBANE | 8210096137085
UPDATE cases c
SET id_number = '8210096137085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUCAS MANDLA MKHEBANE'))
  AND c.id_number IS NULL;

-- KC917 | ZANDILE SIDU | 9904221120886
UPDATE cases c
SET id_number = '9904221120886'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZANDILE SIDU'))
  AND c.id_number IS NULL;

-- KC918 | SIYABONGA WITNESS MBONGWA | 9307185380086
UPDATE cases c
SET id_number = '9307185380086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIYABONGA WITNESS MBONGWA'))
  AND c.id_number IS NULL;

-- KC919 | SOLOMZI SIDUKA | 8511226139085
UPDATE cases c
SET id_number = '8511226139085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SOLOMZI SIDUKA'))
  AND c.id_number IS NULL;

-- KC920 | WILLIAM NAYLAND LINCOLN | 6110105046081
UPDATE cases c
SET id_number = '6110105046081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLIAM NAYLAND LINCOLN'))
  AND c.id_number IS NULL;

-- KC921 | EUNICE LEBOGANG MONAMADI | 9210060443088
UPDATE cases c
SET id_number = '9210060443088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EUNICE LEBOGANG MONAMADI'))
  AND c.id_number IS NULL;

-- KC922 | TAFANZWA MUGORO | CN939665
UPDATE cases c
SET id_number = 'CN939665'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TAFANZWA MUGORO'))
  AND c.id_number IS NULL;

-- KC923 | ANDRE DU TOIT | 6312275014085
UPDATE cases c
SET id_number = '6312275014085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDRE DU TOIT'))
  AND c.id_number IS NULL;

-- KC924 | LELANI JEANNE BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LELANI JEANNE BURGER'))
  AND c.id_number IS NULL;

-- KC925 | CHRISTELLE NAUDE | 6802230011085
UPDATE cases c
SET id_number = '6802230011085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTELLE NAUDE'))
  AND c.id_number IS NULL;

-- KC926 | WILLEM JACOBUS BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLEM JACOBUS BURGER'))
  AND c.id_number IS NULL;

-- KC927 | SIYABONGA THOKOZANI NENE | 9204246551088
UPDATE cases c
SET id_number = '9204246551088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIYABONGA THOKOZANI NENE'))
  AND c.id_number IS NULL;

-- KC928 | LODEWYK JEAN BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LODEWYK JEAN BURGER'))
  AND c.id_number IS NULL;

-- KC929 | NGUBANE NOMPUMELELO PURITY | 8506080474081
UPDATE cases c
SET id_number = '8506080474081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NGUBANE NOMPUMELELO PURITY'))
  AND c.id_number IS NULL;

-- KC930 | JOHANNES MATHIBULA BAHULA | 7503046482085
UPDATE cases c
SET id_number = '7503046482085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOHANNES MATHIBULA BAHULA'))
  AND c.id_number IS NULL;

-- KC931 | SIHLE MALINDI | 8205245643082
UPDATE cases c
SET id_number = '8205245643082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIHLE MALINDI'))
  AND c.id_number IS NULL;

-- KC932 | LELANI JEANNE BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LELANI JEANNE BURGER'))
  AND c.id_number IS NULL;

-- KC933 | KATLEGO BENSON PHOKOBYE | 9810245309086
UPDATE cases c
SET id_number = '9810245309086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KATLEGO BENSON PHOKOBYE'))
  AND c.id_number IS NULL;

-- KC934 | WILLEM JACOBUS BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLEM JACOBUS BURGER'))
  AND c.id_number IS NULL;

-- KC935 | FRANS MAISATABA MODISE | 8305295507086
UPDATE cases c
SET id_number = '8305295507086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANS MAISATABA MODISE'))
  AND c.id_number IS NULL;

-- KC936 | WILLEM JACOBUS BURGER SNR | 8804265136082
UPDATE cases c
SET id_number = '8804265136082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLEM JACOBUS BURGER SNR'))
  AND c.id_number IS NULL;

-- KC937 | BONGANI SEAN SAM | 850402 5440 085
UPDATE cases c
SET id_number = '850402 5440 085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONGANI SEAN SAM'))
  AND c.id_number IS NULL;

-- KC938 | LODEWYK JEAN BURGER | 8805270048089
UPDATE cases c
SET id_number = '8805270048089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LODEWYK JEAN BURGER'))
  AND c.id_number IS NULL;

-- KC939 | DAVIES M O MASHILE | 9807165268086
UPDATE cases c
SET id_number = '9807165268086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVIES M O MASHILE'))
  AND c.id_number IS NULL;

-- KC940 | XOLANI KUNENE | 0412206241082
UPDATE cases c
SET id_number = '0412206241082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOLANI KUNENE'))
  AND c.id_number IS NULL;

-- KC941 | XOULE SIBINGILE MTSWENI | 0104290682087
UPDATE cases c
SET id_number = '0104290682087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOULE SIBINGILE MTSWENI'))
  AND c.id_number IS NULL;

-- KC943 | XOULE SIBINGILE MTSWENI | 0104290682087
UPDATE cases c
SET id_number = '0104290682087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOULE SIBINGILE MTSWENI'))
  AND c.id_number IS NULL;

-- KC944 | BHEKI MOLEFE | 9007036116081
UPDATE cases c
SET id_number = '9007036116081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BHEKI MOLEFE'))
  AND c.id_number IS NULL;

-- KC945 | AUDREY KEITUMETSE MOOBI | 9405051085084
UPDATE cases c
SET id_number = '9405051085084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('AUDREY KEITUMETSE MOOBI'))
  AND c.id_number IS NULL;

-- KC946 | J NKOSI | 8707115349088
UPDATE cases c
SET id_number = '8707115349088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('J NKOSI'))
  AND c.id_number IS NULL;

-- KC947 | XOLANE CHRISPASS HLONGWANE | 8302026197089
UPDATE cases c
SET id_number = '8302026197089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOLANE CHRISPASS HLONGWANE'))
  AND c.id_number IS NULL;

-- KC948 | T LETLALO | 8406025598088
UPDATE cases c
SET id_number = '8406025598088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('T LETLALO'))
  AND c.id_number IS NULL;

-- KC949 | KOKETSO PATRIC DINGAAN | 8606235469083
UPDATE cases c
SET id_number = '8606235469083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KOKETSO PATRIC DINGAAN'))
  AND c.id_number IS NULL;

-- KC950 | MPHO MOKHIWE PIET BOSHIELO | 7406076131087
UPDATE cases c
SET id_number = '7406076131087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPHO MOKHIWE PIET BOSHIELO'))
  AND c.id_number IS NULL;

-- KC951 | JABULANI CHRISTOPHER SIBANYONI | 8907225873080
UPDATE cases c
SET id_number = '8907225873080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JABULANI CHRISTOPHER SIBANYONI'))
  AND c.id_number IS NULL;

-- KC952 | TEBOGO KENNETH MOGASHOA | 9202015279089
UPDATE cases c
SET id_number = '9202015279089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TEBOGO KENNETH MOGASHOA'))
  AND c.id_number IS NULL;

-- KC953 | HENNERIKA BETTIE ADAMS | 8010290143081
UPDATE cases c
SET id_number = '8010290143081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HENNERIKA BETTIE ADAMS'))
  AND c.id_number IS NULL;

-- KC954 | THABO NTSOANE | 9603275508085
UPDATE cases c
SET id_number = '9603275508085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO NTSOANE'))
  AND c.id_number IS NULL;

-- KC955 | ALUNGILE NYEMBEZI | 9902065418087
UPDATE cases c
SET id_number = '9902065418087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALUNGILE NYEMBEZI'))
  AND c.id_number IS NULL;

-- KC956 | SIMANGELE BRENDA MONAMA | 8411220321088
UPDATE cases c
SET id_number = '8411220321088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIMANGELE BRENDA MONAMA'))
  AND c.id_number IS NULL;

-- KC957 | Doreen Mabidori & 5 others | DN189547
UPDATE cases c
SET id_number = 'DN189547'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('Doreen Mabidori & 5 others'))
  AND c.id_number IS NULL;

-- KC958 | PENELOCK ZITHA | 8912060830088
UPDATE cases c
SET id_number = '8912060830088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PENELOCK ZITHA'))
  AND c.id_number IS NULL;

-- KC959 | QUEEN MAKHUBELE obo TSAKO NYIKO MAKHUBELE | 8009090834089
UPDATE cases c
SET id_number = '8009090834089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('QUEEN MAKHUBELE obo TSAKO NYIKO MAKHUBELE'))
  AND c.id_number IS NULL;

-- KC960 | DAVID WIEMAN | 7501255058083
UPDATE cases c
SET id_number = '7501255058083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID WIEMAN'))
  AND c.id_number IS NULL;

-- KC961 | SIBUSISO SOLOMON NKOSI | 8703015690085
UPDATE cases c
SET id_number = '8703015690085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIBUSISO SOLOMON NKOSI'))
  AND c.id_number IS NULL;

-- KC962 | BOTSLELO VERONICA LEBURU | 7609240632084
UPDATE cases c
SET id_number = '7609240632084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOTSLELO VERONICA LEBURU'))
  AND c.id_number IS NULL;

-- KC963 | SINEGUGU MSIZI | 8705051515084
UPDATE cases c
SET id_number = '8705051515084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SINEGUGU MSIZI'))
  AND c.id_number IS NULL;

-- KC964 | ZANDILE NTHABISENG NZAMA | 9702081012082
UPDATE cases c
SET id_number = '9702081012082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZANDILE NTHABISENG NZAMA'))
  AND c.id_number IS NULL;

-- KC965 | SIZINZO MSIZI | 7407245980081
UPDATE cases c
SET id_number = '7407245980081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIZINZO MSIZI'))
  AND c.id_number IS NULL;

-- KC966 | SIZWE ERIC NDABA | 8905025977085
UPDATE cases c
SET id_number = '8905025977085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIZWE ERIC NDABA'))
  AND c.id_number IS NULL;

-- KC967 | PERTUNIA ZANDILE MOTHA | 9612070747087
UPDATE cases c
SET id_number = '9612070747087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PERTUNIA ZANDILE MOTHA'))
  AND c.id_number IS NULL;

-- KC968 | NOSIHLE NORELIA NDABA obo KWANDISA NDABA | 8710110232085
UPDATE cases c
SET id_number = '8710110232085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOSIHLE NORELIA NDABA obo KWANDISA NDABA'))
  AND c.id_number IS NULL;

-- KC969 | MATLOLE MARTIN MOPEDI | 7611125350089
UPDATE cases c
SET id_number = '7611125350089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MATLOLE MARTIN MOPEDI'))
  AND c.id_number IS NULL;

-- KC970 | NN NDABA obo MINOR | 8710110232085
UPDATE cases c
SET id_number = '8710110232085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NN NDABA obo MINOR'))
  AND c.id_number IS NULL;

-- KC971 | TLHALEFANG SEBETLELA | 9807036187085
UPDATE cases c
SET id_number = '9807036187085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TLHALEFANG SEBETLELA'))
  AND c.id_number IS NULL;

-- KC972 | NN NDABA obo MINOR | 8710110232085
UPDATE cases c
SET id_number = '8710110232085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NN NDABA obo MINOR'))
  AND c.id_number IS NULL;

-- KC973 | MELISSA MARCHA BRANDT | 9407090084086
UPDATE cases c
SET id_number = '9407090084086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MELISSA MARCHA BRANDT'))
  AND c.id_number IS NULL;

-- KC974 | NOSIHLE NORELIA NDABA | 8710110232085
UPDATE cases c
SET id_number = '8710110232085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOSIHLE NORELIA NDABA'))
  AND c.id_number IS NULL;

-- KC975 | MELISSA MARCHA BRANDT obo | 1301175943084
UPDATE cases c
SET id_number = '1301175943084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MELISSA MARCHA BRANDT obo'))
  AND c.id_number IS NULL;

-- KC976 | CHARLOTTE CAROLINE MURRAY-KAALSEN | 7501090088089
UPDATE cases c
SET id_number = '7501090088089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHARLOTTE CAROLINE MURRAY-KAALSEN'))
  AND c.id_number IS NULL;

-- KC977 | JAQUELINE NOMBEWU | 6907010813087
UPDATE cases c
SET id_number = '6907010813087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JAQUELINE NOMBEWU'))
  AND c.id_number IS NULL;

-- KC978 | COMFORT PHAKAMANI MCAMBI | 9209125745081
UPDATE cases c
SET id_number = '9209125745081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('COMFORT PHAKAMANI MCAMBI'))
  AND c.id_number IS NULL;

-- KC979 | CINDY NOMBEWU obo ALWANDE NOMBEWU | 1706296147086
UPDATE cases c
SET id_number = '1706296147086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CINDY NOMBEWU obo ALWANDE NOMBEWU'))
  AND c.id_number IS NULL;

-- KC980 | MZUYANDA BAM | 7407185581089
UPDATE cases c
SET id_number = '7407185581089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZUYANDA BAM'))
  AND c.id_number IS NULL;

-- KC981 | SIBONGILE CYNTHIA MADLOLO | 8712140925084
UPDATE cases c
SET id_number = '8712140925084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIBONGILE CYNTHIA MADLOLO'))
  AND c.id_number IS NULL;

-- KC982 | BRUCE MASILO | TERMINATED
UPDATE cases c
SET id_number = 'TERMINATED'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BRUCE MASILO'))
  AND c.id_number IS NULL;

-- KC983 | STEVEN MANZINI | 8809056329085
UPDATE cases c
SET id_number = '8809056329085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('STEVEN MANZINI'))
  AND c.id_number IS NULL;

-- KC985 | THOBILE AYANDA PRUDENCE SIGUDU obo SIYAMTHANDA ASANDA SIGUDU | 9404210506080
UPDATE cases c
SET id_number = '9404210506080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOBILE AYANDA PRUDENCE SIGUDU obo SIYAMTHANDA ASANDA SIGUDU'))
  AND c.id_number IS NULL;

-- KC987 | MATSEMELA CONNY MMAKO | 9710180904083
UPDATE cases c
SET id_number = '9710180904083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MATSEMELA CONNY MMAKO'))
  AND c.id_number IS NULL;

-- KC988 | OFENTSE CHARMAINE MOLAPO | 9207220383089
UPDATE cases c
SET id_number = '9207220383089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OFENTSE CHARMAINE MOLAPO'))
  AND c.id_number IS NULL;

-- KC989 | LETHABO GLADYS LEDWABA | 9912240582087
UPDATE cases c
SET id_number = '9912240582087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LETHABO GLADYS LEDWABA'))
  AND c.id_number IS NULL;

-- KC992 | NEO JOHANNA MOKWEBO | 8501190758085
UPDATE cases c
SET id_number = '8501190758085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NEO JOHANNA MOKWEBO'))
  AND c.id_number IS NULL;

-- KC993 | ZODWA GACULA-HOQUE obo KEITUMETSI RAITHULE | 9003281390083
UPDATE cases c
SET id_number = '9003281390083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZODWA GACULA-HOQUE obo KEITUMETSI RAITHULE'))
  AND c.id_number IS NULL;

-- KC994 | NEO JOHANNA MOKWEBO | 8501190758085
UPDATE cases c
SET id_number = '8501190758085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NEO JOHANNA MOKWEBO'))
  AND c.id_number IS NULL;

-- KC995 | MOEKETSI SELEPE | 8611255306082
UPDATE cases c
SET id_number = '8611255306082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOEKETSI SELEPE'))
  AND c.id_number IS NULL;

-- KC996 | ANDRE BEZUIDENHOUT | 8602055008085
UPDATE cases c
SET id_number = '8602055008085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANDRE BEZUIDENHOUT'))
  AND c.id_number IS NULL;

-- KC997 | JABULANI HARMLET MAAKE obo 2 MINORS | 6701135557087
UPDATE cases c
SET id_number = '6701135557087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JABULANI HARMLET MAAKE obo 2 MINORS'))
  AND c.id_number IS NULL;

-- KC998 | MZIKAYIFANI LINDOKUHLE DLOZI | 9710125725080
UPDATE cases c
SET id_number = '9710125725080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MZIKAYIFANI LINDOKUHLE DLOZI'))
  AND c.id_number IS NULL;

-- KCR1000 | GERHARD HENDRIK STOLTZ | 9001095036082
UPDATE cases c
SET id_number = '9001095036082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GERHARD HENDRIK STOLTZ'))
  AND c.id_number IS NULL;

-- KC1001 | SAKHILE SIFISO MNGOMA | 8601205381087
UPDATE cases c
SET id_number = '8601205381087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAKHILE SIFISO MNGOMA'))
  AND c.id_number IS NULL;

-- KC1002 | KHANTSE SEKOANKOETLA obo LESEDI | 8903315635083
UPDATE cases c
SET id_number = '8903315635083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHANTSE SEKOANKOETLA obo LESEDI'))
  AND c.id_number IS NULL;

-- KC1003 | KHANYA LUTHULI | 9503225222086
UPDATE cases c
SET id_number = '9503225222086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHANYA LUTHULI'))
  AND c.id_number IS NULL;

-- KC1004 | SELWYN HENDRICKS | 8501215257089
UPDATE cases c
SET id_number = '8501215257089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SELWYN HENDRICKS'))
  AND c.id_number IS NULL;

-- KC1005 | TSHOLOFELO NKUNA obo TEBATSO NKUNA | 9212190229080
UPDATE cases c
SET id_number = '9212190229080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHOLOFELO NKUNA obo TEBATSO NKUNA'))
  AND c.id_number IS NULL;

-- KC1006 | SPHEPHELO THOKOZANI MAYISA | 0502086451080
UPDATE cases c
SET id_number = '0502086451080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SPHEPHELO THOKOZANI MAYISA'))
  AND c.id_number IS NULL;

-- KC1007 | LORRAINE IDAH HERMANS | 7403251017082
UPDATE cases c
SET id_number = '7403251017082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LORRAINE IDAH HERMANS'))
  AND c.id_number IS NULL;

-- KC1008 | GWEVUMANE NICOLOUS SIBANYONI | 0408095072083
UPDATE cases c
SET id_number = '0408095072083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GWEVUMANE NICOLOUS SIBANYONI'))
  AND c.id_number IS NULL;

-- KC1009 | DANILE VOYIZANA | 9007235280084
UPDATE cases c
SET id_number = '9007235280084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DANILE VOYIZANA'))
  AND c.id_number IS NULL;

-- KC1010 | BERNE PIETER BESTER | 9508085071085
UPDATE cases c
SET id_number = '9508085071085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BERNE PIETER BESTER'))
  AND c.id_number IS NULL;

-- KC1011 | MELISSA BRANDT OBO MELIGHAN | 9407090084088
UPDATE cases c
SET id_number = '9407090084088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MELISSA BRANDT OBO MELIGHAN'))
  AND c.id_number IS NULL;

-- KC1012 | MORNE NEL (LOSS OF SUPPORT) | 8908305015089
UPDATE cases c
SET id_number = '8908305015089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MORNE NEL (LOSS OF SUPPORT)'))
  AND c.id_number IS NULL;

-- KC1013 | NJABULO KHETHUKUTHULA NKABINDE | 0603316144089
UPDATE cases c
SET id_number = '0603316144089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NJABULO KHETHUKUTHULA NKABINDE'))
  AND c.id_number IS NULL;

-- KC1014 | BATHOBILE WENDY NONTOLWANE | 8606121520080
UPDATE cases c
SET id_number = '8606121520080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BATHOBILE WENDY NONTOLWANE'))
  AND c.id_number IS NULL;

-- KC1015 | KEFILWE MOOPELWA | 0203280639089
UPDATE cases c
SET id_number = '0203280639089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEFILWE MOOPELWA'))
  AND c.id_number IS NULL;

-- KC1016 | LERATO TEFU | 8604130583082
UPDATE cases c
SET id_number = '8604130583082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LERATO TEFU'))
  AND c.id_number IS NULL;

-- KC1017 | ELIZABETH ANGEL MKHASHWA obo BANDILE MKHATSHWA | 1908276392084
UPDATE cases c
SET id_number = '1908276392084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZABETH ANGEL MKHASHWA obo BANDILE MKHATSHWA'))
  AND c.id_number IS NULL;

-- KC1018 | MARIE O'CONNEL | 7408230154088
UPDATE cases c
SET id_number = '7408230154088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MARIE O''CONNEL'))
  AND c.id_number IS NULL;

-- KC1019 | REALEBOGA ATLARELANG MEKGWE | 0207290549089
UPDATE cases c
SET id_number = '0207290549089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('REALEBOGA ATLARELANG MEKGWE'))
  AND c.id_number IS NULL;

-- KC1020 | MIYELA HEMILTON HOLENI | 0107125143084
UPDATE cases c
SET id_number = '0107125143084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MIYELA HEMILTON HOLENI'))
  AND c.id_number IS NULL;

-- KC1021 | MNDIYATA SINIKO | 9007225863089
UPDATE cases c
SET id_number = '9007225863089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MNDIYATA SINIKO'))
  AND c.id_number IS NULL;

-- KC1022 | KELEBOGILE MAVIS SALAGAE | 9209151436084
UPDATE cases c
SET id_number = '9209151436084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KELEBOGILE MAVIS SALAGAE'))
  AND c.id_number IS NULL;

-- KC1023 | PULENG MARIA HLANYANE | 7202250550089
UPDATE cases c
SET id_number = '7202250550089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PULENG MARIA HLANYANE'))
  AND c.id_number IS NULL;

-- KC1024 | BONOLO JOSEPH WARD | 9002195591083
UPDATE cases c
SET id_number = '9002195591083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONOLO JOSEPH WARD'))
  AND c.id_number IS NULL;

-- KC1025 | ELIZE JANSE VAN RENSBURG | 7606230085083
UPDATE cases c
SET id_number = '7606230085083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELIZE JANSE VAN RENSBURG'))
  AND c.id_number IS NULL;

-- KC1026 | MALIZWE MESHACK JONINVABA | 7504095495085
UPDATE cases c
SET id_number = '7504095495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MALIZWE MESHACK JONINVABA'))
  AND c.id_number IS NULL;

-- KC1027 | RYAN PETER NANNI | 7503105162081
UPDATE cases c
SET id_number = '7503105162081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RYAN PETER NANNI'))
  AND c.id_number IS NULL;

-- KC1028 | THABANG EPSENIA JIM RAMAFOKO | 8611195462086
UPDATE cases c
SET id_number = '8611195462086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG EPSENIA JIM RAMAFOKO'))
  AND c.id_number IS NULL;

-- KC1029 | THABANG GRAVIES SKOSANA | 9210066096088
UPDATE cases c
SET id_number = '9210066096088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG GRAVIES SKOSANA'))
  AND c.id_number IS NULL;

-- KC1030 | THABO ANDREW MABONGO | 8304115952085
UPDATE cases c
SET id_number = '8304115952085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABO ANDREW MABONGO'))
  AND c.id_number IS NULL;

-- KC1031 | THABANG MATTHWES MASHAPA | 8010155416085
UPDATE cases c
SET id_number = '8010155416085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG MATTHWES MASHAPA'))
  AND c.id_number IS NULL;

-- KC1032 | MOLEBOGENG N MOEPI | 9006280650084
UPDATE cases c
SET id_number = '9006280650084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOLEBOGENG N MOEPI'))
  AND c.id_number IS NULL;

-- KC1033 | KHANYISILE DANISO | 8012016048081
UPDATE cases c
SET id_number = '8012016048081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KHANYISILE DANISO'))
  AND c.id_number IS NULL;

-- KC1034 | TSHEGOFATSO LILLIAN NGWIRA | 9902131152082
UPDATE cases c
SET id_number = '9902131152082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEGOFATSO LILLIAN NGWIRA'))
  AND c.id_number IS NULL;

-- KC1035 | STEVENS MAHLOMOLA MINI | 8611275729081
UPDATE cases c
SET id_number = '8611275729081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('STEVENS MAHLOMOLA MINI'))
  AND c.id_number IS NULL;

-- KC1036 | TSOTSO VANECIA MOHOHLOANE | 7510085436088
UPDATE cases c
SET id_number = '7510085436088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSOTSO VANECIA MOHOHLOANE'))
  AND c.id_number IS NULL;

-- KC1037 | THABANG IRVIN MAINE | 8907035922085
UPDATE cases c
SET id_number = '8907035922085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABANG IRVIN MAINE'))
  AND c.id_number IS NULL;

-- KC1038 | KABELO STEPHEN KHESUOE | 6601145686084
UPDATE cases c
SET id_number = '6601145686084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KABELO STEPHEN KHESUOE'))
  AND c.id_number IS NULL;

-- KC1039 | NTOMBIFUTHO MPEMBA | 9406070692080
UPDATE cases c
SET id_number = '9406070692080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTOMBIFUTHO MPEMBA'))
  AND c.id_number IS NULL;

-- KC1040 | FERDINAND KEHRHAHN | 8501105002089
UPDATE cases c
SET id_number = '8501105002089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FERDINAND KEHRHAHN'))
  AND c.id_number IS NULL;

-- KC1042 | WILLIAM MAHLAYLA | 9401095899085
UPDATE cases c
SET id_number = '9401095899085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WILLIAM MAHLAYLA'))
  AND c.id_number IS NULL;

-- KC1043 | MPUMELELO PATRICK MKHALIPI | 8004065243085
UPDATE cases c
SET id_number = '8004065243085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MPUMELELO PATRICK MKHALIPI'))
  AND c.id_number IS NULL;

-- KC1045 | MBALENHLE PRINCESS HOPE MVELASE | 1812290578084
UPDATE cases c
SET id_number = '1812290578084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MBALENHLE PRINCESS HOPE MVELASE'))
  AND c.id_number IS NULL;

-- KC1046 | ISHMAEL PAPANE MAFAMBANE | 8411285407087
UPDATE cases c
SET id_number = '8411285407087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ISHMAEL PAPANE MAFAMBANE'))
  AND c.id_number IS NULL;

-- KC1047 | SANDILE VILAKAZI | 8301285608083
UPDATE cases c
SET id_number = '8301285608083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SANDILE VILAKAZI'))
  AND c.id_number IS NULL;

-- KC1048 | ESETHU BELAYNEH KASA | PTAETH002731024
UPDATE cases c
SET id_number = 'PTAETH002731024'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ESETHU BELAYNEH KASA'))
  AND c.id_number IS NULL;

-- KC1049 | EVA SALOME MOTLHOKI | 9812030320088
UPDATE cases c
SET id_number = '9812030320088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EVA SALOME MOTLHOKI'))
  AND c.id_number IS NULL;

-- KC1050 | MALASA WONDIMU TILAHUN | PTAETH008171123
UPDATE cases c
SET id_number = 'PTAETH008171123'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MALASA WONDIMU TILAHUN'))
  AND c.id_number IS NULL;

-- KC1051 | BOITMELO MOGOLE | 9708050780088
UPDATE cases c
SET id_number = '9708050780088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOITMELO MOGOLE'))
  AND c.id_number IS NULL;

-- KC1052 | FRANS MALOME SEBOTHOMA | 7205165616085
UPDATE cases c
SET id_number = '7205165616085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANS MALOME SEBOTHOMA'))
  AND c.id_number IS NULL;

-- KC1053 | LUCKY TANDANE MSIBI | 7901065876080
UPDATE cases c
SET id_number = '7901065876080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LUCKY TANDANE MSIBI'))
  AND c.id_number IS NULL;

-- KC1054 | FRANK GOVERNMENT SULMAN | 8105155426082
UPDATE cases c
SET id_number = '8105155426082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANK GOVERNMENT SULMAN'))
  AND c.id_number IS NULL;

-- KC1055 | NKOSINATHI MORRIS MADONSELA | 9304275264080
UPDATE cases c
SET id_number = '9304275264080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKOSINATHI MORRIS MADONSELA'))
  AND c.id_number IS NULL;

-- KC1056 | TSHEPO MARTIN MKWEBANE | 7708205817084
UPDATE cases c
SET id_number = '7708205817084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPO MARTIN MKWEBANE'))
  AND c.id_number IS NULL;

-- KC1057 | KARABO IVAN NGWANE | 981116022088
UPDATE cases c
SET id_number = '981116022088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KARABO IVAN NGWANE'))
  AND c.id_number IS NULL;

-- KC1058 | EDWARD TSWALEDI LEOPE | 7908275963087
UPDATE cases c
SET id_number = '7908275963087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('EDWARD TSWALEDI LEOPE'))
  AND c.id_number IS NULL;

-- KC1059 | THOBEKANI INNOCENT MATHE | 8810315417083
UPDATE cases c
SET id_number = '8810315417083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOBEKANI INNOCENT MATHE'))
  AND c.id_number IS NULL;

-- KC1060 | SIPHIWE MAFUYA | 9209275463089
UPDATE cases c
SET id_number = '9209275463089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIPHIWE MAFUYA'))
  AND c.id_number IS NULL;

-- KC1061 | TUMELO RECTOR LETSHOLO | 8912095547087
UPDATE cases c
SET id_number = '8912095547087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TUMELO RECTOR LETSHOLO'))
  AND c.id_number IS NULL;

-- KC1062 | RABELANI MUDAU | 9406065831083
UPDATE cases c
SET id_number = '9406065831083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RABELANI MUDAU'))
  AND c.id_number IS NULL;

-- KC1063 | OLERATO KGALALETSO MOSHE | 0612160676088
UPDATE cases c
SET id_number = '0612160676088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('OLERATO KGALALETSO MOSHE'))
  AND c.id_number IS NULL;

-- KC1064 | ELSIE LETTA KEKANA | 8211100262083
UPDATE cases c
SET id_number = '8211100262083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ELSIE LETTA KEKANA'))
  AND c.id_number IS NULL;

-- KC1065 | SILANE MARGARET TSHARANI | 921216863082
UPDATE cases c
SET id_number = '921216863082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SILANE MARGARET TSHARANI'))
  AND c.id_number IS NULL;

-- KC1066 | ZUKO MTAMZELI | 9109256157082
UPDATE cases c
SET id_number = '9109256157082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZUKO MTAMZELI'))
  AND c.id_number IS NULL;

-- KC1067 | NOKUPHIWA FOUR NGUBANE | 950725562084
UPDATE cases c
SET id_number = '950725562084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOKUPHIWA FOUR NGUBANE'))
  AND c.id_number IS NULL;

-- KC1068 | ODETTA THELE MOKOENA | 8207040812086
UPDATE cases c
SET id_number = '8207040812086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ODETTA THELE MOKOENA'))
  AND c.id_number IS NULL;

-- KC1069 | SIYANDA ZANDILE CELE | 0005200174083
UPDATE cases c
SET id_number = '0005200174083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIYANDA ZANDILE CELE'))
  AND c.id_number IS NULL;

-- KC1070 | BOITUMELO TSHEPANG SENYOLO | 0612045342088
UPDATE cases c
SET id_number = '0612045342088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOITUMELO TSHEPANG SENYOLO'))
  AND c.id_number IS NULL;

-- KC1072 | LETLHOPILWE MOLELEKWA | 0012090930087
UPDATE cases c
SET id_number = '0012090930087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('LETLHOPILWE MOLELEKWA'))
  AND c.id_number IS NULL;

-- KC1074 | BOITSHEPO JONNAS MOFOKENG | 9803215323088
UPDATE cases c
SET id_number = '9803215323088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOITSHEPO JONNAS MOFOKENG'))
  AND c.id_number IS NULL;

-- KC1075 | XOULE SIBINGILE MTSWENI | 0104290682087
UPDATE cases c
SET id_number = '0104290682087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('XOULE SIBINGILE MTSWENI'))
  AND c.id_number IS NULL;

-- KC1077 | STHEMBILE PRECIOUS TSOLO obo MPHO GIFT TSOLO | 8511270330085
UPDATE cases c
SET id_number = '8511270330085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('STHEMBILE PRECIOUS TSOLO obo MPHO GIFT TSOLO'))
  AND c.id_number IS NULL;

-- KC1078 | JEFFREY MODISANA MASELWANE | 7008045996085
UPDATE cases c
SET id_number = '7008045996085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JEFFREY MODISANA MASELWANE'))
  AND c.id_number IS NULL;

-- KC1079 | HAPPY MASHEGO | 7101010667087
UPDATE cases c
SET id_number = '7101010667087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HAPPY MASHEGO'))
  AND c.id_number IS NULL;

-- KC1080 | DUDUZILE MBOKANE | 9302201144087
UPDATE cases c
SET id_number = '9302201144087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DUDUZILE MBOKANE'))
  AND c.id_number IS NULL;

-- KC1081 | NOPINKI GWANTSHU obo SIVE | 7510251041084
UPDATE cases c
SET id_number = '7510251041084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOPINKI GWANTSHU obo SIVE'))
  AND c.id_number IS NULL;

-- KC1082 | DUDUZILE MBOKANE | 9302201144087
UPDATE cases c
SET id_number = '9302201144087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DUDUZILE MBOKANE'))
  AND c.id_number IS NULL;

-- KC1083 | BONGUMUSA JOSHUA PHAKATHI | 8203305640080
UPDATE cases c
SET id_number = '8203305640080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONGUMUSA JOSHUA PHAKATHI'))
  AND c.id_number IS NULL;

-- KC1084 | TSHIAMO MOKAU | 0607066727084
UPDATE cases c
SET id_number = '0607066727084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHIAMO MOKAU'))
  AND c.id_number IS NULL;

-- KC1085 | JAIROS SUNNYBOY LETADI | 9007016128080
UPDATE cases c
SET id_number = '9007016128080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JAIROS SUNNYBOY LETADI'))
  AND c.id_number IS NULL;

-- KC1086 | TSHEGOFATSO MOKAU | 0510206334066
UPDATE cases c
SET id_number = '0510206334066'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEGOFATSO MOKAU'))
  AND c.id_number IS NULL;

-- KC1087 | NIMROD THAPHELO JR MACHEBE | 0505065399089
UPDATE cases c
SET id_number = '0505065399089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NIMROD THAPHELO JR MACHEBE'))
  AND c.id_number IS NULL;

-- KC1088 | KEALEBOGA MAGOME | 8912206682088
UPDATE cases c
SET id_number = '8912206682088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KEALEBOGA MAGOME'))
  AND c.id_number IS NULL;

-- KC1089 | BOY ISAAC MASHININI | 7902115457087
UPDATE cases c
SET id_number = '7902115457087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOY ISAAC MASHININI'))
  AND c.id_number IS NULL;

-- KC1090 | PHILLIP MVULA | 0405156289085
UPDATE cases c
SET id_number = '0405156289085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHILLIP MVULA'))
  AND c.id_number IS NULL;

-- KC1091 | CARMEN VAN DER WALT | 0108230077084
UPDATE cases c
SET id_number = '0108230077084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CARMEN VAN DER WALT'))
  AND c.id_number IS NULL;

-- KC1092 | S'FISO SIBONGISENI GUMEDE | 7608245830081
UPDATE cases c
SET id_number = '7608245830081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('S''FISO SIBONGISENI GUMEDE'))
  AND c.id_number IS NULL;

-- KC1093 | NTHABELENG ELSAH SECHITYE | 8712252133089
UPDATE cases c
SET id_number = '8712252133089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NTHABELENG ELSAH SECHITYE'))
  AND c.id_number IS NULL;

-- KC1094 | THOLAKELE CONSTANCE LUVUNO | 7901090392087
UPDATE cases c
SET id_number = '7901090392087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THOLAKELE CONSTANCE LUVUNO'))
  AND c.id_number IS NULL;

-- KC1095 | TINTSWALO KINDNESS MARINGA | 9102020718081
UPDATE cases c
SET id_number = '9102020718081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TINTSWALO KINDNESS MARINGA'))
  AND c.id_number IS NULL;

-- KC1096 | PERTUNIA NKUNA | 8911060743085
UPDATE cases c
SET id_number = '8911060743085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PERTUNIA NKUNA'))
  AND c.id_number IS NULL;

-- KC1097 | MAITE ROSEMARY MOJELA | 7309120833080
UPDATE cases c
SET id_number = '7309120833080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MAITE ROSEMARY MOJELA'))
  AND c.id_number IS NULL;

-- KC1098 | NOUTHANDO SHIBE | 9312220650089
UPDATE cases c
SET id_number = '9312220650089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOUTHANDO SHIBE'))
  AND c.id_number IS NULL;

-- KC1099 | MALIBONGWE NGOBESE | 8201305577088
UPDATE cases c
SET id_number = '8201305577088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MALIBONGWE NGOBESE'))
  AND c.id_number IS NULL;

-- KC1100 | PRECIUS TSHOLOFELO NCHOE | 9205170634089
UPDATE cases c
SET id_number = '9205170634089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PRECIUS TSHOLOFELO NCHOE'))
  AND c.id_number IS NULL;

-- KC1101 | CALEB RUSSELL FLORENCE | 9702125031080
UPDATE cases c
SET id_number = '9702125031080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CALEB RUSSELL FLORENCE'))
  AND c.id_number IS NULL;

-- KC1102 | THULANE ZWANE | 8505215872086
UPDATE cases c
SET id_number = '8505215872086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THULANE ZWANE'))
  AND c.id_number IS NULL;

-- KC1103 | SIMANGALISO MASEKO | 9304145872088
UPDATE cases c
SET id_number = '9304145872088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIMANGALISO MASEKO'))
  AND c.id_number IS NULL;

-- KC1104 | ONKGOPOTSE NGKGAPE SEHUME | 8601156195080
UPDATE cases c
SET id_number = '8601156195080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ONKGOPOTSE NGKGAPE SEHUME'))
  AND c.id_number IS NULL;

-- KC1105 | BOKAMOSO MPILO MOTSO | 2103306119082
UPDATE cases c
SET id_number = '2103306119082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BOKAMOSO MPILO MOTSO'))
  AND c.id_number IS NULL;

-- KC1106 | ONKGOPOTSE NGKGAPE | 8601156195080
UPDATE cases c
SET id_number = '8601156195080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ONKGOPOTSE NGKGAPE'))
  AND c.id_number IS NULL;

-- KC1107 | PHILLEMON MOHANOE POLILE | 7609175583088
UPDATE cases c
SET id_number = '7609175583088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHILLEMON MOHANOE POLILE'))
  AND c.id_number IS NULL;

-- KC1108 | DAVID NASO MBULI | 8002035881083
UPDATE cases c
SET id_number = '8002035881083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAVID NASO MBULI'))
  AND c.id_number IS NULL;

-- KC1109 | MMAMOKETE VIOLET MODIBEDI | 7609100818088
UPDATE cases c
SET id_number = '7609100818088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MMAMOKETE VIOLET MODIBEDI'))
  AND c.id_number IS NULL;

-- KC1110 | WALTER CLEO MCHAWE | 8311205917084
UPDATE cases c
SET id_number = '8311205917084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WALTER CLEO MCHAWE'))
  AND c.id_number IS NULL;

-- KC1111 | TLHALOSO JUSTICE MAROBELE | .9601255207082
UPDATE cases c
SET id_number = '.9601255207082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TLHALOSO JUSTICE MAROBELE'))
  AND c.id_number IS NULL;

-- KC1112 | MAGGY MATSEKE MATLALA | .9601255207082
UPDATE cases c
SET id_number = '.9601255207082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MAGGY MATSEKE MATLALA'))
  AND c.id_number IS NULL;

-- KC1113 | JACK LORD BILWANE | 8512257138087
UPDATE cases c
SET id_number = '8512257138087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JACK LORD BILWANE'))
  AND c.id_number IS NULL;

-- KC1114 | MMABATHO MARGARET BALOYI | 8007150834080
UPDATE cases c
SET id_number = '8007150834080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MMABATHO MARGARET BALOYI'))
  AND c.id_number IS NULL;

-- KC1115 | CEBISILE ABIGEL NXUMALO oboBANELE | 9001280495085
UPDATE cases c
SET id_number = '9001280495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CEBISILE ABIGEL NXUMALO oboBANELE'))
  AND c.id_number IS NULL;

-- KC1116 | THANDAZILE PRINCESS MBATHA | 8709301318083
UPDATE cases c
SET id_number = '8709301318083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDAZILE PRINCESS MBATHA'))
  AND c.id_number IS NULL;

-- KC1117 | CEBISILE ABIGEL NXUMALO obo APHIWE | 9001280495085
UPDATE cases c
SET id_number = '9001280495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CEBISILE ABIGEL NXUMALO obo APHIWE'))
  AND c.id_number IS NULL;

-- KC1118 | SEPHIWE MASEKO | 0506031102086
UPDATE cases c
SET id_number = '0506031102086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SEPHIWE MASEKO'))
  AND c.id_number IS NULL;

-- KC1119 | NKOSINAMANDLA KHOZA | 8706266441082
UPDATE cases c
SET id_number = '8706266441082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKOSINAMANDLA KHOZA'))
  AND c.id_number IS NULL;

-- KC1120 | VUYOKAZI MAYISHE | 8703221054084
UPDATE cases c
SET id_number = '8703221054084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUYOKAZI MAYISHE'))
  AND c.id_number IS NULL;

-- KC1121 | CEBISILE ABIGEL NXUMALO | 9001280495085
UPDATE cases c
SET id_number = '9001280495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CEBISILE ABIGEL NXUMALO'))
  AND c.id_number IS NULL;

-- KC1122 | REFILOE MOLATLEGI | 8508110901083
UPDATE cases c
SET id_number = '8508110901083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('REFILOE MOLATLEGI'))
  AND c.id_number IS NULL;

-- KC1123 | DAISY MUDAU | 8112120447086
UPDATE cases c
SET id_number = '8112120447086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('DAISY MUDAU'))
  AND c.id_number IS NULL;

-- KC1124 | TSHEPO PHEKOLA | 8709085772083
UPDATE cases c
SET id_number = '8709085772083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPO PHEKOLA'))
  AND c.id_number IS NULL;

-- KC1125 | MOHAU PHILLIP SELELE | 8003255890085
UPDATE cases c
SET id_number = '8003255890085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOHAU PHILLIP SELELE'))
  AND c.id_number IS NULL;

-- KC1126 | KAGISANO WILLIAM PHEKOLA | 0209135221080
UPDATE cases c
SET id_number = '0209135221080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KAGISANO WILLIAM PHEKOLA'))
  AND c.id_number IS NULL;

-- KC1127 | SEETJIEETJIE JENNIFER MATLOHA | 8604181164089
UPDATE cases c
SET id_number = '8604181164089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SEETJIEETJIE JENNIFER MATLOHA'))
  AND c.id_number IS NULL;

-- KC1128 | NONHLANHLA PRECIOUS NHLENGETHWA | 9810080701082
UPDATE cases c
SET id_number = '9810080701082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NONHLANHLA PRECIOUS NHLENGETHWA'))
  AND c.id_number IS NULL;

-- KC1130 | ITANI HAMES MANAHA | 7711065504081
UPDATE cases c
SET id_number = '7711065504081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ITANI HAMES MANAHA'))
  AND c.id_number IS NULL;

-- KC1131 | MANDILAKHE DZAI | 8702035949083
UPDATE cases c
SET id_number = '8702035949083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MANDILAKHE DZAI'))
  AND c.id_number IS NULL;

-- KC1132 | VERONICA ALICIA SWARTZ | 9103050290082
UPDATE cases c
SET id_number = '9103050290082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VERONICA ALICIA SWARTZ'))
  AND c.id_number IS NULL;

-- KC1133 | SENZENI NELSON MTSHALI | 8212305608088
UPDATE cases c
SET id_number = '8212305608088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SENZENI NELSON MTSHALI'))
  AND c.id_number IS NULL;

-- KC1134 | JAN KOKETSO MONAMA | 0206026193089
UPDATE cases c
SET id_number = '0206026193089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JAN KOKETSO MONAMA'))
  AND c.id_number IS NULL;

-- KC1135 | ALEX CEDRIC KABELO SELEPE | 8312135224088
UPDATE cases c
SET id_number = '8312135224088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALEX CEDRIC KABELO SELEPE'))
  AND c.id_number IS NULL;

-- KC1137 | CHANTAL JACKLYN SELEPE | 8111250102081
UPDATE cases c
SET id_number = '8111250102081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHANTAL JACKLYN SELEPE'))
  AND c.id_number IS NULL;

-- KC1139 | TAEGRIN TUMELO SELE | 1410235872082
UPDATE cases c
SET id_number = '1410235872082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TAEGRIN TUMELO SELE'))
  AND c.id_number IS NULL;

-- KC1140 | CHALDON WEBB TITUS obo DESWILL (MINOR) | 9102165172086
UPDATE cases c
SET id_number = '9102165172086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHALDON WEBB TITUS obo DESWILL (MINOR)'))
  AND c.id_number IS NULL;

-- KC1141 | ANGELINE KHAMBULE obo MELOKUHLE TRACY | 0101150811087
UPDATE cases c
SET id_number = '0101150811087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANGELINE KHAMBULE obo MELOKUHLE TRACY'))
  AND c.id_number IS NULL;

-- KC1142 | SAPOKAZI SIDLAYIYA | 105130929083'
UPDATE cases c
SET id_number = '105130929083'''
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAPOKAZI SIDLAYIYA'))
  AND c.id_number IS NULL;

-- KC1143 | THANDUYISE JOJISA | 8706185892084
UPDATE cases c
SET id_number = '8706185892084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDUYISE JOJISA'))
  AND c.id_number IS NULL;

-- KC1144 | CATHERINE TAMBO OFENTSE | 1809216440084
UPDATE cases c
SET id_number = '1809216440084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CATHERINE TAMBO OFENTSE'))
  AND c.id_number IS NULL;

-- KC1145 | ANGELINE KHAMBULE obo LISAKHAYA MELISSA | 0101150811087
UPDATE cases c
SET id_number = '0101150811087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ANGELINE KHAMBULE obo LISAKHAYA MELISSA'))
  AND c.id_number IS NULL;

-- KC1146 | PHEPHISIWE XOLILE LUTHULI obo LETHUKUTHULA KWENZAKWENOSI | 1810096131082
UPDATE cases c
SET id_number = '1810096131082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHEPHISIWE XOLILE LUTHULI obo LETHUKUTHULA KWENZAKWENOSI'))
  AND c.id_number IS NULL;

-- KC1147 | VUYOLWETHU MBEKI obo OKUHLE CHRISTINA MBEKI | 9206011573080
UPDATE cases c
SET id_number = '9206011573080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUYOLWETHU MBEKI obo OKUHLE CHRISTINA MBEKI'))
  AND c.id_number IS NULL;

-- KC1148 | MAVIMBELA NOMKHOSI | 0102070628080
UPDATE cases c
SET id_number = '0102070628080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MAVIMBELA NOMKHOSI'))
  AND c.id_number IS NULL;

-- KC1152 | SOLLY JUNIOR QONGO | 0002165347085
UPDATE cases c
SET id_number = '0002165347085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SOLLY JUNIOR QONGO'))
  AND c.id_number IS NULL;

-- KC1153 | ABIGEL CEBISILE NXUMALO obo NOKUBONGA | 9001280495085
UPDATE cases c
SET id_number = '9001280495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ABIGEL CEBISILE NXUMALO obo NOKUBONGA'))
  AND c.id_number IS NULL;

-- KC1154 | NOMBALU MDUBA | 7808050662088
UPDATE cases c
SET id_number = '7808050662088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOMBALU MDUBA'))
  AND c.id_number IS NULL;

-- KC1155 | CEBISILE ABIGEL NXUMALO OBO SIPHILILE OKUHLE NXUMALO | 9001280495085
UPDATE cases c
SET id_number = '9001280495085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CEBISILE ABIGEL NXUMALO OBO SIPHILILE OKUHLE NXUMALO'))
  AND c.id_number IS NULL;

-- KC1156 | MANDLA THABANI ZULU | 8106185677082
UPDATE cases c
SET id_number = '8106185677082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MANDLA THABANI ZULU'))
  AND c.id_number IS NULL;

-- KC1157 | KATLEGO MALETE | 9407195836083
UPDATE cases c
SET id_number = '9407195836083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KATLEGO MALETE'))
  AND c.id_number IS NULL;

-- KC1158 | GERALD MOARABI MODISE | 302121263081
UPDATE cases c
SET id_number = '302121263081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GERALD MOARABI MODISE'))
  AND c.id_number IS NULL;

-- KC1159 | KLAUS WALTER BRINKMANN | 430217 5008 180
UPDATE cases c
SET id_number = '430217 5008 180'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KLAUS WALTER BRINKMANN'))
  AND c.id_number IS NULL;

-- KC1160 | KARABO MABESELE | 0302121263081
UPDATE cases c
SET id_number = '0302121263081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KARABO MABESELE'))
  AND c.id_number IS NULL;

-- KC1161 | THAPELO DIRENYANE | 0010315770080
UPDATE cases c
SET id_number = '0010315770080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THAPELO DIRENYANE'))
  AND c.id_number IS NULL;

-- KC1163 | THANDEKA MDLULI | 8708290787084
UPDATE cases c
SET id_number = '8708290787084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THANDEKA MDLULI'))
  AND c.id_number IS NULL;

-- KC1164 | RUTH TEBOHO MPOLWENI | 9209030327082
UPDATE cases c
SET id_number = '9209030327082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RUTH TEBOHO MPOLWENI'))
  AND c.id_number IS NULL;

-- KC1165 | TSEKO POKANE | 0612095183085
UPDATE cases c
SET id_number = '0612095183085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSEKO POKANE'))
  AND c.id_number IS NULL;

-- KC1166 | BONGIWE BRENDA | 8202281247084
UPDATE cases c
SET id_number = '8202281247084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('BONGIWE BRENDA'))
  AND c.id_number IS NULL;

-- KC1167 | WALLACER MAYISELA | 8902045270088
UPDATE cases c
SET id_number = '8902045270088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WALLACER MAYISELA'))
  AND c.id_number IS NULL;

-- KC1168 | WELCOME MOLELEKI | 7504296402089
UPDATE cases c
SET id_number = '7504296402089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('WELCOME MOLELEKI'))
  AND c.id_number IS NULL;

-- KC1169 | SAMUEL THOKORANE SEKGOBELA | 8108135508086
UPDATE cases c
SET id_number = '8108135508086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SAMUEL THOKORANE SEKGOBELA'))
  AND c.id_number IS NULL;

-- KC1170 | MUNZHEDZI DUNCAN NENGUDZA | 9106136185085
UPDATE cases c
SET id_number = '9106136185085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MUNZHEDZI DUNCAN NENGUDZA'))
  AND c.id_number IS NULL;

-- KC1171 | MANUEL MALULEKE | 7908295425083
UPDATE cases c
SET id_number = '7908295425083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MANUEL MALULEKE'))
  AND c.id_number IS NULL;

-- KC1172 | ZAMOKWAKHE ZUNGU | 8705025418084
UPDATE cases c
SET id_number = '8705025418084'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ZAMOKWAKHE ZUNGU'))
  AND c.id_number IS NULL;

-- KC1173 | NKOSANA MKHABELA | 8605205301086
UPDATE cases c
SET id_number = '8605205301086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NKOSANA MKHABELA'))
  AND c.id_number IS NULL;

-- KC1174 | MOTUDUMA THABO MOTHUSI | 830606607087
UPDATE cases c
SET id_number = '830606607087'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MOTUDUMA THABO MOTHUSI'))
  AND c.id_number IS NULL;

-- KC1175 | NOMBEKO BRENDA JEJE | 7907240778083
UPDATE cases c
SET id_number = '7907240778083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('NOMBEKO BRENDA JEJE'))
  AND c.id_number IS NULL;

-- KC1176 | FREDERICK BOITSHOKO MONTSHOSI | 950129 5310088
UPDATE cases c
SET id_number = '950129 5310088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FREDERICK BOITSHOKO MONTSHOSI'))
  AND c.id_number IS NULL;

-- KC1177 | ALLOYSIUS KAGISO MOTSHEGOPA | 9105146110083
UPDATE cases c
SET id_number = '9105146110083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('ALLOYSIUS KAGISO MOTSHEGOPA'))
  AND c.id_number IS NULL;

-- KC1178 | MICHAEL DIPUO | 8610306058080
UPDATE cases c
SET id_number = '8610306058080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MICHAEL DIPUO'))
  AND c.id_number IS NULL;

-- KC1179 | HOPHEKILE LEA TSHUMA | 9502040186088
UPDATE cases c
SET id_number = '9502040186088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('HOPHEKILE LEA TSHUMA'))
  AND c.id_number IS NULL;

-- KC1180 | FRANCE NAKEDI | 87070735978080
UPDATE cases c
SET id_number = '87070735978080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('FRANCE NAKEDI'))
  AND c.id_number IS NULL;

-- KC1181 | TSHEPISO ALPHEIUS MOTAUNG | 9109016209082
UPDATE cases c
SET id_number = '9109016209082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('TSHEPISO ALPHEIUS MOTAUNG'))
  AND c.id_number IS NULL;

-- KC1182 | SIYABONGA NTANJANA | 8908055770081
UPDATE cases c
SET id_number = '8908055770081'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SIYABONGA NTANJANA'))
  AND c.id_number IS NULL;

-- KC1184 | GRAIG DANILE NGENO | 7804245554082
UPDATE cases c
SET id_number = '7804245554082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('GRAIG DANILE NGENO'))
  AND c.id_number IS NULL;

-- KC1185 | KABELO JULIUS MASHIGO | 9104246344080
UPDATE cases c
SET id_number = '9104246344080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('KABELO JULIUS MASHIGO'))
  AND c.id_number IS NULL;

-- KC1187 | CHRISTOFF MOKOKA | 8212305740089
UPDATE cases c
SET id_number = '8212305740089'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('CHRISTOFF MOKOKA'))
  AND c.id_number IS NULL;

-- KC1188 | MENEZ ALBINO MATSOVELE | 000805 5403 086
UPDATE cases c
SET id_number = '000805 5403 086'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('MENEZ ALBINO MATSOVELE'))
  AND c.id_number IS NULL;

-- KC1189 | RAPULA MOOPELO | 7801126091085
UPDATE cases c
SET id_number = '7801126091085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('RAPULA MOOPELO'))
  AND c.id_number IS NULL;

-- KC1190 | SELLO GIDEON MAKGWE | 840215 5610 083
UPDATE cases c
SET id_number = '840215 5610 083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SELLO GIDEON MAKGWE'))
  AND c.id_number IS NULL;

-- KC1192 | JOANA PEDRO BIZA | 0202122896082
UPDATE cases c
SET id_number = '0202122896082'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('JOANA PEDRO BIZA'))
  AND c.id_number IS NULL;

-- KC1193 | THABISO KENNETH JUNIOR LEKALE | 990205295088
UPDATE cases c
SET id_number = '990205295088'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('THABISO KENNETH JUNIOR LEKALE'))
  AND c.id_number IS NULL;

-- KC1194 | VUSIMUZI MNCUBE | 0402046751085
UPDATE cases c
SET id_number = '0402046751085'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('VUSIMUZI MNCUBE'))
  AND c.id_number IS NULL;

-- KC1195 | SUNNYBOY MABOA | 811028
UPDATE cases c
SET id_number = '811028'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('SUNNYBOY MABOA'))
  AND c.id_number IS NULL;

-- KC1197 | PHILA TALENT MAZIBUKO | 9503086002080
UPDATE cases c
SET id_number = '9503086002080'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHILA TALENT MAZIBUKO'))
  AND c.id_number IS NULL;

-- KC1198 | PHUMZILE THAGE | 9005300273083
UPDATE cases c
SET id_number = '9005300273083'
FROM profiles p
WHERE c.client_id = p.id
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM('PHUMZILE THAGE'))
  AND c.id_number IS NULL;


-- ========================================
-- Generated: 769 UPDATE statements
-- Skipped: 328 rows (non-ID values in ID column)
-- ========================================

-- SKIPPED ROWS (no valid ID number):
-- SKIPPED: KC002 | ANTONETTE HOUGH (non-ID value: "FINALIZED")
-- SKIPPED: KC010 | LUNGILE  GOODHOPE NDABANA (non-ID value: "FINALIZED")
-- SKIPPED: KC013 | NOTHABO NUNDUDUZO MOKOENA (non-ID value: "FINALIZED")
-- SKIPPED: KC014 | SIMPHIWE NXUMALO (non-ID value: "FINALIZED")
-- SKIPPED: KC015 | NOTHILE RIANA NXUMALO (non-ID value: "FINALIZED")
-- SKIPPED: KC019 | MULLER FOURIE (non-ID value: "FINALIZED")
-- SKIPPED: KC021 | MANDIE FIVAZ (non-ID value: "FINALIZED")
-- SKIPPED: KC022 | ITANI WELHELMINAH RAMBUWANI (non-ID value: "FINALIZED")
-- SKIPPED: KC023 | COLLIN ANDREW DOUBELL (non-ID value: "COSTS ONLY")
-- SKIPPED: KC026 | SAANTJIE REYGERT OBO (non-ID value: "FINALIZED")
-- SKIPPED: KC027 | JOHN SANDAKO NGOBENI (non-ID value: "FINALIZED")
-- SKIPPED: KC030 | VALMARI SMITH (non-ID value: "COSTS ONLY")
-- SKIPPED: KC031 | PIETER WILLEM VAN DER BANK (non-ID value: "FINALIZED")
-- SKIPPED: KC032 | TSHEPO MOKONE (non-ID value: "FINALIZED")
-- SKIPPED: KC034 | ROLETT RAMBUWANI (non-ID value: "FINALIZED")
-- SKIPPED: KC037 | MADALITSO KAMANGA (non-ID value: "COSTS ONLY")
-- SKIPPED: KC038 | SUHAVANAH PARATHNANDH (non-ID value: "COSTS ONLY")
-- SKIPPED: KC043 | CYRIL LEBEPE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC044 | THABO MATHEWS MAINE OBO TSHEGOFATSO EVATONIA FIHLA (non-ID value: "FINALIZED")
-- SKIPPED: KC052 | SETAKI ABRAM MOKWENA (non-ID value: "COSTS ONLY")
-- SKIPPED: KC053 | SOLLY SOLOMON MALAZA (non-ID value: "FINALIZED")
-- SKIPPED: KC055 | RUDOLF J VAN RENSBURG (non-ID value: "FINALIZED")
-- SKIPPED: KC056 | SOPHIE SEKGAPANE OBO (non-ID value: "COSTS ONLY")
-- SKIPPED: KC059 | S MALOBANE OBO NEO (non-ID value: "ABANDONED")
-- SKIPPED: KC061 | S MALOBANE OBO NEO (non-ID value: "ABANDONED")
-- SKIPPED: KC064 | MARIETJIE VAN DEVENTER (non-ID value: "FINALIZED")
-- SKIPPED: KC079 | MAMSIE EVA MUHLANGA (non-ID value: "COSTS ONLY")
-- SKIPPED: KC080 | CORRIE WESTRAAT (non-ID value: "FINALIZED")
-- SKIPPED: KC082 | JUNIOR MOKOATLO (non-ID value: "COSTS ONLY")
-- SKIPPED: KC086 | MICHAEL VAN NIEKERK (non-ID value: "COSTS ONLY")
-- SKIPPED: KC088 | K PETRUS MOSIE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC089 | TOBIE LANDSBERG (non-ID value: "COSTS ONLY")
-- SKIPPED: KC091 | L GABAFEDIWE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC092 | N PATRICIA FIKIZOLO (non-ID value: "FINALIZED")
-- SKIPPED: KC093 | I VICTOR XAVIER (non-ID value: "COSTS ONLY")
-- SKIPPED: KC096 | VERA BRIEDENHANN (non-ID value: "COSTS ONLY")
-- SKIPPED: KC097 | PORTIA MAAKE OBO (non-ID value: "COSTS ONLY")
-- SKIPPED: KC098 | KEISHA T SOLOMONS (non-ID value: "COSTS ONLY")
-- SKIPPED: KC102 | THADI J LERUTLA (non-ID value: "COSTS ONLY")
-- SKIPPED: KC104 | PATRICK MADIGAGE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC105 | M DAVID THABETHE (non-ID value: "FINALIZED")
-- SKIPPED: KC106 | LEZELL KEHRHAHN (non-ID value: "FINALIZED")
-- SKIPPED: KC107 | ALAN AYAMI (non-ID value: "COSTS ONLY")
-- SKIPPED: KC111 | MF MAILA OBO COMFORT (non-ID value: "FINALIZED")
-- SKIPPED: KC112 | MJ SITHOLE OBO (non-ID value: "COSTS ONLY")
-- SKIPPED: KC116 | CELESTE E MAITE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC118 | C MASANGO OBO WENDY (non-ID value: "COSTS ONLY")
-- SKIPPED: KC120 | DAVID S KHAILE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC123 | THERESIA MALAPILE (non-ID value: "FINALIZED")
-- SKIPPED: KC124 | PAULINAH HLONGWANE (non-ID value: "FINALIZED")
-- SKIPPED: KC125 | KUTSO E RAMAKGOPOLA (non-ID value: "COSTS ONLY")
-- SKIPPED: KC128 | NATALIE MATABOGE (non-ID value: "FINALIZED")
-- SKIPPED: KC129 | NELLY LIMBANE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC131 | KARIN HERHOLDT (non-ID value: "FINALIZED")
-- SKIPPED: KC134 | PHUMI MORITHI (non-ID value: "FINALIZED")
-- SKIPPED: KC138 | PULENG VICTORIA MOIKETSI (non-ID value: "COSTS ONLY")
-- SKIPPED: KC148 | RENE ANNANDALE (non-ID value: "FINALIZED")
-- SKIPPED: KC151 | STANLEY LIMBANE (non-ID value: "FINALIZED")
-- SKIPPED: KC152 | POLELO THAMAGE (non-ID value: "FINALIZED")
-- SKIPPED: KC154 | XOLANI SANDILE MBOKANE (non-ID value: "COSTS ONLY")
-- SKIPPED: KC166 | KOBUS ROSSOUW (non-ID value: "COSTS ONLY")
-- SKIPPED: KC173 | N ERIMACHO AWOL (non-ID value: "FINALIZED")
-- SKIPPED: KC200 | MICHAEL DAVIDSON (non-ID value: "FINALIZED")
-- SKIPPED: KC203 | STANISLAUS MAKOA (non-ID value: "undefined")
-- SKIPPED: KC204 | WILLEM BARTHOLOMEUS VAN JAARSVELD (non-ID value: "undefined")
-- SKIPPED: KC205 | ABRAHAM LIEMBRECHT PRETORIUS (non-ID value: "undefined")
-- SKIPPED: KC208 | JOSEPH HUNGWE (non-ID value: "undefined")
-- SKIPPED: KC212 | NICKY PUTANA (non-ID value: "undefined")
-- SKIPPED: KC213 | GLADYS MATHOPA (non-ID value: "undefined")
-- SKIPPED: KC214 | LIZZY SITHOLE (non-ID value: "undefined")
-- SKIPPED: KC217 | JEANETH NGOBENI (non-ID value: "undefined")
-- SKIPPED: KC219 | LAPPIES LABUSCHAGNE (non-ID value: "undefined")
-- SKIPPED: KC220 | TERSIA KRUGER (non-ID value: "undefined")
-- SKIPPED: KC221 | TERSIUS KRUGER (non-ID value: "undefined")
-- SKIPPED: KC223 | ELSIE KRAFT (non-ID value: "undefined")
-- SKIPPED: KC225 | SUNE KEHRHAHN (non-ID value: "undefined")
-- SKIPPED: KC228 | RICARDO MEINTJIES (non-ID value: "undefined")
-- SKIPPED: KC229 | SHIKO MONAGENG (non-ID value: "undefined")
-- SKIPPED: KC230 | SAMSON RAGANYA (non-ID value: "undefined")
-- SKIPPED: KC231 | JANNIE KUKKUK (non-ID value: "undefined")
-- SKIPPED: KC234 | WILLEM NEL (non-ID value: "undefined")
-- SKIPPED: KCS237 | MACDONALD MASHAO (non-ID value: "undefined")
-- SKIPPED: KCS238 | JUANITA STRYDOM OBO MINORS (non-ID value: "undefined")
-- SKIPPED: KCS239 | JUANITA STRYDOM (non-ID value: "undefined")
-- SKIPPED: KCS240 | JUANITA OBO AIMEE-LEE (non-ID value: "undefined")
-- SKIPPED: KCS244 | F NYAMHANDU (non-ID value: "undefined")
-- SKIPPED: KCS246 | TB RANGOAELI (non-ID value: "undefined")
-- SKIPPED: KCS247 | SW KONZHAPI (non-ID value: "undefined")
-- SKIPPED: KCS248 | JAMES TALIOE (non-ID value: "undefined")
-- SKIPPED: KCS249 | KN RAMBALI OBO T RAMADHIN (non-ID value: "undefined")
-- SKIPPED: KCS252 | JM SELMOLELA (non-ID value: "undefined")
-- SKIPPED: KCS254 | TP MAHLANGU (non-ID value: "undefined")
-- SKIPPED: KC255 | D V EEDEN OBO A ERASMUS (non-ID value: "undefined")
-- SKIPPED: KCS256 | MK MOTSHWANE (non-ID value: "undefined")
-- SKIPPED: KCS257 | LT MODISAKENG (non-ID value: "undefined")
-- SKIPPED: KCS258 | PRECIOUS K ZWANE obo MINOR (non-ID value: "undefined")
-- SKIPPED: KC262 | SALOME ELIZABETH MULLER OBO ZULIKA HUMAN (non-ID value: "undefined")
-- SKIPPED: KCS264 | MAAMASHU SOPHY THAMAGA OBO 3 MINORS (non-ID value: "undefined")
-- SKIPPED: KCS265 | MAPEDI NELLY BALOYI OBO NKELE COMFORT MOSIME (non-ID value: "undefined")
-- SKIPPED: KCS266 | PAGISO FRANCE BALOYI (non-ID value: "undefined")
-- SKIPPED: KCS269 | CHRISTIAAN RUDOLPH VENTER OBO TARYN MELANIE VENTER (non-ID value: "undefined")
-- SKIPPED: KCS271 | TIISETSO SOLOMON MASHILE (non-ID value: "undefined")
-- SKIPPED: KCS275 | ZANELE MASINA (non-ID value: "undefined")
-- SKIPPED: KCS276 | ZANELE MASINA OBO DILA JOAQIUM (non-ID value: "undefined")
-- SKIPPED: KCS278 | JACQUES BOUWER (non-ID value: "undefined")
-- SKIPPED: KCS279 | MIKE MASOPA (non-ID value: "undefined")
-- SKIPPED: KC281 | JOHNATHAN LA GRANGE (non-ID value: "undefined")
-- SKIPPED: KCS282 | SUNNYBOY ANDRIES MOTSHWANE (non-ID value: "undefined")
-- SKIPPED: KCj283 | SUSARA CORNELIA SMAL OBO DIONE NINA SMAL (non-ID value: "undefined")
-- SKIPPED: KCj286 | SUSARA CORNELIA SMAL OBO STEFAN DANIE SMAL (non-ID value: "undefined")
-- SKIPPED: KCj287 | SUSARA CORNELIA SMAL OBO CHARNELLE CHAVON SMAL (non-ID value: "undefined")
-- SKIPPED: KCj288 | BIANCA PEGGY SMAL (non-ID value: "undefined")
-- SKIPPED: KCS293 | MOHAMID SAFEE MIA (non-ID value: "undefined")
-- SKIPPED: KCS294 | SOMAYYA MIA (non-ID value: "undefined")
-- SKIPPED: KC296 | DEFEGA ABUTE BETORE (non-ID value: "undefined")
-- SKIPPED: KCs301 | MPHO MOHALE OBO THATE MOHALE (non-ID value: "undefined")
-- SKIPPED: KCj302 | ENGELA VAN DER RIET OBO DANIELLA RAATHS (non-ID value: "undefined")
-- SKIPPED: KCj303 | ELIZABETH LOMBARD OBO ROSA LEE LOMBARD (non-ID value: "undefined")
-- SKIPPED: KCj305 | ELIZABETH LOMBARD OBO CHRISTELLE DANIELLE LOMBARD (non-ID value: "undefined")
-- SKIPPED: KCj309 | SIBUSISO THUSI (non-ID value: "undefined")
-- SKIPPED: KC310 | ERIC HAGEN (non-ID value: "undefined")
-- SKIPPED: KCs312 | DONALD MOTLOGELWA MAEBANE (non-ID value: "undefined")
-- SKIPPED: KC314 | MARCH REGINAH NDULI (non-ID value: "undefined")
-- SKIPPED: KCj315 | JAN VAN DER BANK (non-ID value: "undefined")
-- SKIPPED: KCj316 | MIA JADE PARPINEL (non-ID value: "undefined")
-- SKIPPED: KC319 | MARINA GESINA CHRISTINA JORDAAN (non-ID value: "undefined")
-- SKIPPED: KCs322 | CHANTELLE HECHTER OBO ANTONIO HECHTER (non-ID value: "undefined")
-- SKIPPED: KC323 | WILLEM HERMAN NEL (non-ID value: "undefined")
-- SKIPPED: KC326 | NICOLENE CAROLYN DE WAAL (non-ID value: "undefined")
-- SKIPPED: KCS327 | MPHO REBECCA SEKHU OBO GOGONTLE ONKOKAME SEKHU (non-ID value: "undefined")
-- SKIPPED: KC328 | VIRGINIA MERVIA JACOBS OBO SHANAIS BERNICE LAIKEN SWARTZ (non-ID value: "undefined")
-- SKIPPED: KC329 | LESHAAN SERENITY SWARTZ (non-ID value: "undefined")
-- SKIPPED: KCS334 | VELAPHI MABASO (non-ID value: "undefined")
-- SKIPPED: KC336 | PORTIA MOHLARI (non-ID value: "undefined")
-- SKIPPED: KCS337 | BK MOLATLHWE (non-ID value: "undefined")
-- SKIPPED: KCS338 | PT KOMBE (non-ID value: "undefined")
-- SKIPPED: KCS339 | D LUNGA (non-ID value: "undefined")
-- SKIPPED: KCS340 | DD BIKWANE (non-ID value: "undefined")
-- SKIPPED: KCS341 | DIANA FISCHER (non-ID value: "undefined")
-- SKIPPED: KCSS342 | CONRAD SCHOLTZ (non-ID value: "undefined")
-- SKIPPED: KCS343 | CHRISTINA NAOMI BARKLY (non-ID value: "undefined")
-- SKIPPED: KCS344 | MACDONALD TSHEPANG MACHONYANE (non-ID value: "undefined")
-- SKIPPED: KCS345 | HANS BARENDSE (non-ID value: "undefined")
-- SKIPPED: KCS346 | G. SILWANE OBO MINOR (non-ID value: "undefined")
-- SKIPPED: KCS348 | P.V. POTELO (non-ID value: "undefined")
-- SKIPPED: KCS349 | M.R.N. DE KOKER (non-ID value: "undefined")
-- SKIPPED: KCS350 | G.P.Q NELSON (non-ID value: "undefined")
-- SKIPPED: KCS354 | TA ADAMS obo EJ (non-ID value: "undefined")
-- SKIPPED: KCS355 | A.S. SEGEONE (non-ID value: "undefined")
-- SKIPPED: KCj360 | ILKE CARMEL (non-ID value: "undefined")
-- SKIPPED: KCj361 | VANESSA ROWELL MURRAY (non-ID value: "undefined")
-- SKIPPED: KCj362 | ELIZABETH PULENG KWAGO (non-ID value: "undefined")
-- SKIPPED: KC363 | MOUCHANE MEIER (non-ID value: "undefined")
-- SKIPPED: KC364 | WYNAND ALF NESS (non-ID value: "undefined")
-- SKIPPED: KC365 | JAN GABRIEL VAN NIEKERK (non-ID value: "undefined")
-- SKIPPED: KC367 | KONRAD BEUKES (non-ID value: "undefined")
-- SKIPPED: KCS369 | MARIUS BEKKER (non-ID value: "undefined")
-- SKIPPED: KC373 | MATHILDA MOKONE (non-ID value: "undefined")
-- SKIPPED: KC374 | MONNAMOHOLO MESHACK MPHUTHI (non-ID value: "undefined")
-- SKIPPED: KCS377 | MAMELLO CONSTANCE NHUHA OBO KEITUMETSE MPUMELELO LANGALEBALELE (non-ID value: "undefined")
-- SKIPPED: KCS378 | DRIKUS SWANEPOEL (non-ID value: "undefined")
-- SKIPPED: KC381 | MAESELA MISHACK MOGASHWA (non-ID value: "undefined")
-- SKIPPED: KC384 | JOHANNES NOWA MAHLANGU (non-ID value: "undefined")
-- SKIPPED: KCS388 | INNOCENT OMPHILE MMUSI (non-ID value: "undefined")
-- SKIPPED: KCS389 | REINETTE LOU-ANN HARMS (non-ID value: "undefined")
-- SKIPPED: KCS395 | JAN LODEWYK SMITH (non-ID value: "undefined")
-- SKIPPED: KCS397 | MICHELLE KITTY SMITH (non-ID value: "undefined")
-- SKIPPED: KCS398 | BONGANI CELIMPILO MBUYISA (non-ID value: "undefined")
-- SKIPPED: KC401 | BIANCA ACKERMANN (non-ID value: "undefined")
-- SKIPPED: KCS403 | KHANG ISHMAEL MOKOMO (non-ID value: "undefined")
-- SKIPPED: KC404 | RHONA NAIDOO (non-ID value: "undefined")
-- SKIPPED: KCS406 | NGWANALEKATANA CATHERINE MOSOTHO (non-ID value: "undefined")
-- SKIPPED: KCS407 | NANCY TLOPORO RAMASHABA OBO THULANI SMANGALISO (non-ID value: "undefined")
-- SKIPPED: KCS408 | MABEL ARENDSE (non-ID value: "undefined")
-- SKIPPED: KCS410 | MOTLALEPULE MARGARET KORASI (non-ID value: "undefined")
-- SKIPPED: KCS411 | PAULI MOGANE MONOGE (non-ID value: "undefined")
-- SKIPPED: KCS412 | NCOMEKLE SYBEL NGCOBO (non-ID value: "undefined")
-- SKIPPED: KCS414 | MBONGENI CHRISTOPHER DWEKU (non-ID value: "undefined")
-- SKIPPED: KCS415 | OUPA STOFFEL SERAPELO (non-ID value: "undefined")
-- SKIPPED: KCS416 | JOHN NAKEDI (non-ID value: "undefined")
-- SKIPPED: KCS418 | GOODNESS ZODWA MHLONGO (non-ID value: "undefined")
-- SKIPPED: KCS420 | SINDIE PORTIA MNDAWE (non-ID value: "undefined")
-- SKIPPED: KCS422 | PEGGY NHLANHLA SIBISI (non-ID value: "undefined")
-- SKIPPED: KCS423 | FISUKUPHILE MENZI ZULU (non-ID value: "undefined")
-- SKIPPED: KCS426 | LODEWIKUS VAN DER MERWE WHITE - LOSS (non-ID value: "undefined")
-- SKIPPED: KCS428 | LODEWIKUS VAN DER MERWE WHITE OBO KAITLYN WHITE (non-ID value: "undefined")
-- SKIPPED: KCS429 | THABISO BEATRICE MAGWEBU (non-ID value: "undefined")
-- SKIPPED: KCS430 | WILLEM ADRIAAN FREDERIK VAN ASWEGEN OBO WIAN (non-ID value: "undefined")
-- SKIPPED: KCS433 | DESALGN DUBAGO HKESO (non-ID value: "undefined")
-- SKIPPED: KCS434 | THORISO TOKOLLO LEKGAU (non-ID value: "undefined")
-- SKIPPED: KCS435 | CHRISTABEL SUKWINI (non-ID value: "undefined")
-- SKIPPED: KCS437 | MICHAEL SUKWINI (non-ID value: "undefined")
-- SKIPPED: KCS439 | NOMQHELE SUKWINI (non-ID value: "undefined")
-- SKIPPED: KCS440 | MALEBU MABUSELA (non-ID value: "undefined")
-- SKIPPED: KC441 | AMOS THATO MKHOMA (non-ID value: "undefined")
-- SKIPPED: KC442 | SIMPHIWE GOODMAN MTHETHWA (non-ID value: "undefined")
-- SKIPPED: KC443 | JULIAN REYNEKE (non-ID value: "undefined")
-- SKIPPED: KCS447 | ELIJAH DIBAKWANE (non-ID value: "undefined")
-- SKIPPED: KC448 | VERONICA VAN NIEKERK (non-ID value: "undefined")
-- SKIPPED: KCS452 | LYNETTE  BERRANGE (non-ID value: "undefined")
-- SKIPPED: KCS453 | LYNETTE BERRANGE OBO (non-ID value: "undefined")
-- SKIPPED: KC454 | BISHOP SEASHANE (non-ID value: "undefined")
-- SKIPPED: KC458 | WILLEM NEL (non-ID value: "undefined")
-- SKIPPED: KCS459 | NOQHELE SWIKINI (non-ID value: "undefined")
-- SKIPPED: KCM464 | MARUPA TOKOYO (non-ID value: "undefined")
-- SKIPPED: KCM465 | HONEST VUTLARI BILANKULU (non-ID value: "undefined")
-- SKIPPED: KC469 | RONELLE MEYER (non-ID value: "undefined")
-- SKIPPED: KC473 | YVONNE COERTSE (non-ID value: "undefined")
-- SKIPPED: KC474 | TUMELO KEKANA (non-ID value: "undefined")
-- SKIPPED: KC476 | ELSA JOHANNA ZANDBERG (non-ID value: "undefined")
-- SKIPPED: KC477 | MARINA GESINA CHRISTINA JORDAAN (non-ID value: "undefined")
-- SKIPPED: KC478 | GRACE ZWANE (non-ID value: "undefined")
-- SKIPPED: KC482 | THANDO VINCENZO JUNIOR RATLADI (non-ID value: "undefined")
-- SKIPPED: KC486 | MARTINETTE NORTIER OBO THEUNS VAN RHYN (non-ID value: "undefined")
-- SKIPPED: KC487 | VINCENT NGOBENI (non-ID value: "undefined")
-- SKIPPED: KC488 | VINCENT NGOBENI (non-ID value: "undefined")
-- SKIPPED: KC489 | ANNIE JUDITH VERMAAK (non-ID value: "undefined")
-- SKIPPED: KC495 | WILLEM JOHANNES BRITS (non-ID value: "undefined")
-- SKIPPED: KCS500 | SOPHIE MAMSI SEKURU (non-ID value: "undefined")
-- SKIPPED: KCS503 | MPHIWA MASHININI (non-ID value: "undefined")
-- SKIPPED: KCS506 | SIHLE DUBE OBO SIPHOSETHU DUBE (non-ID value: "undefined")
-- SKIPPED: KCS512 | JOHANNA ALWYNA HUMAN OBO WERNER A LANDY (non-ID value: "undefined")
-- SKIPPED: KCS520 | MDUDUZI ANTHONY MTSHWENE (non-ID value: "undefined")
-- SKIPPED: KCS522 | EVAH VALENTINE MSIZA OBO BHEKUMUZI MTHIMUNYE (non-ID value: "undefined")
-- SKIPPED: KCS523 | PAMELA RUTH CHAUKE (non-ID value: "undefined")
-- SKIPPED: KCS524 | EVAH VALENTINE MSIZA (non-ID value: "undefined")
-- SKIPPED: KC527 | BOMVU (non-ID value: "undefined")
-- SKIPPED: KCS531 | GIBSON MUKWASHO NYAKANDI (non-ID value: "undefined")
-- SKIPPED: KCS536 | REDGEWELL HUNGWE (non-ID value: "undefined")
-- SKIPPED: KC538 | ANNAH ZODWA NKOSI (non-ID value: "undefined")
-- SKIPPED: KCS540 | BENJAMIN BLIGNAUT (non-ID value: "undefined")
-- SKIPPED: KCS544 | KEANO MALOULY (non-ID value: "undefined")
-- SKIPPED: KCS548 | NTELISHENG MARIA SIBILOANE (non-ID value: "undefined")
-- SKIPPED: KC552 | ZAKHELE JAMES HLATSHWAYO (non-ID value: "undefined")
-- SKIPPED: KCS556 | COLLETA MUPOPERI (non-ID value: "undefined")
-- SKIPPED: KCS558 | PREZENZO ALWOU ELCIDO DEWEE (non-ID value: "undefined")
-- SKIPPED: KCS559 | PRUDENCE PATEL (non-ID value: "undefined")
-- SKIPPED: KCS560 | SANDRA PEACE RADEBE (non-ID value: "undefined")
-- SKIPPED: KCS561 | DONOVAN DIAS OBO DARIUS (non-ID value: "undefined")
-- SKIPPED: KC562 | LINDA MOTAUNG (non-ID value: "undefined")
-- SKIPPED: KCS563 | PRUDENCE PATEL OBO KRISHNA (non-ID value: "undefined")
-- SKIPPED: KCS564 | OSVALDO ATANASIO CHINOME (non-ID value: "undefined")
-- SKIPPED: KCS565 | PRUDENCE PATEL OBO ASHWIN (non-ID value: "undefined")
-- SKIPPED: KCS566 | MOHAMMED ISMAIL NAKHOODA (non-ID value: "undefined")
-- SKIPPED: KCS568 | KEABETSWE IVER MASHEGO OBO PHOLOSHO SAREL SIWELA (non-ID value: "undefined")
-- SKIPPED: KCS570 | MUTINGURA FRANK MUNGUAKONKWA (non-ID value: "undefined")
-- SKIPPED: KCS572 | MCEBISI PHATHILIZWE HLABA (non-ID value: "undefined")
-- SKIPPED: KCS574 | ADIVHAHO RAZWIMISANI (non-ID value: "undefined")
-- SKIPPED: KCS576 | MAMOKGADE LUCY NKADIMENG (non-ID value: "undefined")
-- SKIPPED: KCS578 | PETER CHITSIKE (non-ID value: "undefined")
-- SKIPPED: KCS580 | AZARIAS ALVES MASSINGUE (non-ID value: "undefined")
-- SKIPPED: KCS584 | BAFANA JOSHUA TWALA (non-ID value: "undefined")
-- SKIPPED: KC591 | DONOVAN ANDRIES KRAUSE (non-ID value: "undefined")
-- SKIPPED: KC593 | JOYCE MANTHUGANE LEBOEA (non-ID value: "undefined")
-- SKIPPED: KC594 | MAUREEN BEVERLY RAMOSHABA (non-ID value: "undefined")
-- SKIPPED: KC599 | TADEYOS YOHANES MOLTUMO (non-ID value: "undefined")
-- SKIPPED: KC601 | YVONEE COERTSE OBO (non-ID value: "undefined")
-- SKIPPED: KCS614 | ROXANNE MULDER (non-ID value: "undefined")
-- SKIPPED: KCS624 | MORNE ARCHER (non-ID value: "undefined")
-- SKIPPED: KCS627 | VUSUMUZI DESMOND VILAKAZI (non-ID value: "undefined")
-- SKIPPED: KCS637 | TINY JOHANNA BALOYI (non-ID value: "undefined")
-- SKIPPED: KC660 | K DU PLESSIS (non-ID value: "undefined")
-- SKIPPED: KCS664 | KARABO SELITISHA (non-ID value: "undefined")
-- SKIPPED: KC671 | WH NEL (non-ID value: "undefined")
-- SKIPPED: KCS675 | MARI JANA FLORI MBENA obo R (non-ID value: "undefined")
-- SKIPPED: KCS681 | KABELO SALDILE KGOSIENG (non-ID value: "undefined")
-- SKIPPED: KCS690 | SEPHAMO DAVID MOAGI (non-ID value: "undefined")
-- SKIPPED: KCS701 | FABRICE NSHIMIRIMANA (non-ID value: "undefined")
-- SKIPPED: KCS711 | TERENCE NCUBE (non-ID value: "undefined")
-- SKIPPED: KCS713 | SIBUSISO GEORGE MASEKO (non-ID value: "undefined")
-- SKIPPED: KC717 | JUANDRE WOLMARANS (non-ID value: "undefined")
-- SKIPPED: KCS720 | SAMUEL LETSHOLO MAKHOBELA (non-ID value: "CLOSED")
-- SKIPPED: KCS722 | LEBOGANG LEE-ANNE MAHLAULE ob RK (non-ID value: "CLOSED")
-- SKIPPED: KCS724 | PULENG BRENDA SENATLE obo THS (non-ID value: "CLOSED")
-- SKIPPED: KCS726 | MARIA S MOPHUTHING obo MINORS (non-ID value: "CLOSED")
-- SKIPPED: KC730 | ANOLD (non-ID value: "CLOSED")
-- SKIPPED: KC740 | JP STORM (non-ID value: "CLOSED")
-- SKIPPED: KC741 | WINNIE M MANKABA (non-ID value: "undefined")
-- SKIPPED: KC751 | PHAKADE SODAWE (non-ID value: "undefined")
-- SKIPPED: KC754 | LETLHOGONOLO TLHOTLHOMISANG (non-ID value: "CLOSED")
-- SKIPPED: KC756 | DELRESE PHYLICIA BOOYSEN OBO (non-ID value: "CLOSED")
-- SKIPPED: KC760 | TLHALELO JACOBS (non-ID value: "CLOSED")
-- SKIPPED: KC763 | ANDRIES MASHUDU MOKWEVHO (non-ID value: "undefined")
-- SKIPPED: KC764 | DEON LAZARUS (non-ID value: "CLOSED")
-- SKIPPED: KC765 | ALBERTINA JOSE MACUACUA (non-ID value: "undefined")
-- SKIPPED: KC769 | GCINETHEM ELIZABETH MABASO (non-ID value: "undefined")
-- SKIPPED: KC770 | LERATO MDLALOSE obo NDUMISO THOBANE (non-ID value: "CLOSED")
-- SKIPPED: KC771 | MENZI ANDISWA MABASO (non-ID value: "undefined")
-- SKIPPED: KCK775 | OFENTSE GLADWIN GAADISE (non-ID value: "undefined")
-- SKIPPED: KC779 | WH NEL (U/T EXPENSES) (non-ID value: "undefined")
-- SKIPPED: KC781 | LEHLOHONOLO MOKUINE (non-ID value: "undefined")
-- SKIPPED: KC784 | LESEDI DANIEL KRAAI (non-ID value: "CLOSED")
-- SKIPPED: KC800 | LYDIA SHONGWE (non-ID value: "CLOSED")
-- SKIPPED: KC804 | SIBUSISO GEORGE MASEKO (non-ID value: "CLOSED")
-- SKIPPED: KC811 | CHRISTINA SHADI MODISANE obo (non-ID value: "undefined")
-- SKIPPED: KC813 | RONELLE MEYER (non-ID value: "undefined")
-- SKIPPED: KC818 | KABENGELE TSHIUNZA (non-ID value: "undefined")
-- SKIPPED: KC837 | ELDER KHOZA (non-ID value: "undefined")
-- SKIPPED: KC841 | HLAYISANI HECTOR HLUNGWANE (non-ID value: "undefined")
-- SKIPPED: KC849 | MSUNUKAWULAHLWA NDOLO MPUNGOSE (non-ID value: "undefined")
-- SKIPPED: KC850 | JABULANI BONGINKOSI ZWANE (non-ID value: "undefined")
-- SKIPPED: KC851 | SOLLY SEFUME (non-ID value: "undefined")
-- SKIPPED: KC856 | ERIC SIZIBA (non-ID value: "undefined")
-- SKIPPED: KC857 | KUNDANI HAPPY SIAGA (non-ID value: "undefined")
-- SKIPPED: KC873 | SONLO MONICA NGWENYA obo S JELE (non-ID value: "undefined")
-- SKIPPED: KC915 | SUSANNA LUCIA BYVELDS (non-ID value: "undefined")
-- SKIPPED: KC942 | MPHEPHETHE ANTONY (non-ID value: "undefined")
-- SKIPPED: KC984 | VERNEY ANGELINE BOOYSEN obo ZONOXOLO (non-ID value: "undefined")
-- SKIPPED: KC986 | THABO MOKGETHI (non-ID value: "undefined")
-- SKIPPED: KC990 | KHULANE CYPRIAN KHUZWAYO (non-ID value: "undefined")
-- SKIPPED: KC991 | JOEL SELLO MABITSELA (non-ID value: "undefined")
-- SKIPPED: KC999 | MAMEJA MAPONYA (non-ID value: "undefined")
-- SKIPPED: KC1041 | THABO ELIA THOPOLO (non-ID value: "undefined")
-- SKIPPED: KC1044 | TEBOGO LUCKY SIMBINE (non-ID value: "undefined")
-- SKIPPED: KC1071 | NTHABISENG CAROLINE RATABANE (non-ID value: "?")
-- SKIPPED: KC1073 | NTHABISENG CARONILE RATABANE obo MAITHERI OARABILE RATABANE (non-ID value: "?")
-- SKIPPED: KC1076 | WILLEM NEL (non-ID value: "undefined")
-- SKIPPED: KC1129 | RAFAEL FARUQUE GOVE (non-ID value: "undefined")
-- SKIPPED: KC1136 | CLOSED FILE (non-ID value: "undefined")
-- SKIPPED: KC1138 | CLOSED FILE (non-ID value: "undefined")
-- SKIPPED: KC1149 | AKONA OLWETHU MABASO (non-ID value: "undefined")
-- SKIPPED: KC1150 | NOMPUMELELO DIANA SIBIYA (non-ID value: "undefined")
-- SKIPPED: KC1151 | BONGO GOMPO (non-ID value: "undefined")
-- SKIPPED: KC1162 | MARIA NYAMANHINDI (non-ID value: "undefined")
-- SKIPPED: KC1183 | DAVID KABELO PHEGE (non-ID value: "undefined")
-- SKIPPED: KC1186 | LERATO LESIA (non-ID value: "undefined")
-- SKIPPED: KC1191 | MMABUSUSU JOSEPH LEHUTSO (non-ID value: "undefined")
-- SKIPPED: KC1196 | MAGALAGALA DANIEL (non-ID value: "undefined")

COMMIT;
