-- Import Marble Hall cases
BEGIN;

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL113', 'TSOTSI JOSEPH MASHASHA', '630902 5397 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL116', 'MORONGWE RINAH TSIANE', '801209 0654 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL118', 'RAMSHI SOLOMON MOGWANE', '840303 6902 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL120', 'WENDY NOKWAZI MASOKA ’n.O', '870708 0736 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL121', 'SEMAKALENG MAGANEDISA obo A', '9309151519085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL122', 'DAPHNEY MAMOKOTSE MOELA', '7304090643080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL123', 'SEWELA THUTLWA', '951019 0053 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL125', 'APRIL MAESELA SEBAYANA', '', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL127', 'RAGOSEBO ALBERTINA MOYELA', '700505 1707 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL128', 'DANIEL MOTJANE NCHABELENG', '870407 5676 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL129', 'HUNADI MAKONDO obo MINORS', '910328 0987 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL130', 'TSEKE DAVID RADINGWANA', '620316 5768 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL131', 'RATABANE PHILLIP MAKGAILA', '530111 5552 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL132', 'MALLEHO WHELHEMINA NKADIMENG', '650404 1093 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL133', 'SEKE LETTIE MONAMA', '690407 0587 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL134', 'TEBOGO MMELA obo MINORS', '830225 1081 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL135', 'SAMUEL OUPA MATHELELA', '660925 5778 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL136', 'DIPUO MELVILLE BOLUE obo K', '850908 1140 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL137', 'MAMPAKA JOHN TAGANE', '880607 5565 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL138', 'BONGINKOSI MKHWANAZI', '860119 6064 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL139', 'TALATALA ISAAC PHETLA', '890919 6370 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL140', 'AUBREY TSHEPISO ZUNGU', '800801 5621 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL141', 'JACOB MAKUBE MALATSI obo B', '710627 5322 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL142', 'MMOLAO WILLIAM MAKUA', '601002 5611 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL143', 'PHOHU DOCTOR NAWE', '911216 6368 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL144', 'JUDITH NKELE MPHEGO', '880221 0450 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL145', 'KLAAS SIPHO MATJE', '791111 5518 08', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL147', 'SAMSON MASANGO', '760404 7029 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL148', 'SESSIE JOSEPHINAH ZULU', '840528 0942 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL149', 'PROMISE MMABANE obo L', '990414 1300 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL150', 'WILLIAM MADIMETJA MOGALE', '830324 5594 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL151', 'GILBERT NORISHI MORABA', '770205 5301 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL152', 'John JACK MAHLANGU', '620311 5803 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL153', 'BANYATSAMANG FLORAH MAGORO', '840102 0939 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('BL155', 'BONI THOKOANE', '980407 5792 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('FT28', 'LIEZL BIEWENGA', '740420 0002 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('FT29', 'FRANCOIS UYS', '731217 5110 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('FT34', 'KIERIAN LEE CROFT', '980722 5561 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('FT35', 'ELSABE JEANNE KRAUSE', '920619 0066 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L244', 'MZIMBA', '', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1238', 'VUSI PETROS P SKOSANA', '771121 5392 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1253', 'MAHLODI MOERA RADINGWANA obo T', '810915 0337 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1255', 'MAHLODI MOERA RADINGWANA obo T', '810915 0337 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1273', 'MOROTE ALPHEUS RAKGWALE', '870317 5410 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1274', 'SAMUEL SITHOLE', '960224 5577 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1278', 'ANDRE MANUEL CHILANGO', '770520 6050 186', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1279', 'THEMBA LUCAS MASANAGO', '680227 5401 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1280', 'SANELE EDWARD MNGUNI', '780108 5383 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1284', 'SAMUEL SITHOLE', '960224 5577 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1293', 'LESEDI SIPHOKAZI MAHLANGU', '100520 0777 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1294', 'PETER DUMISANI MATHSIANE', '8808215366087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1295', 'HABONATHWE ELIZABETH NGWENYA', '740625 0719 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1298', 'BRIDGETT MAKGAKA', '990528 0334 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1299', 'BEATRICE SIMPHIWE NGWENYA', '961212 1129 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1301', 'MATHABATE OUMA MOGOBA', '800705 0651 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1303', 'VINCENT MMASIKHUNGWANE MPANYANE', '720218 5327 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1306', 'MANKATI MAVIS CHOEU', '761010 0814 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1308', 'VICTORIA NONHLAHLA SKOSANA', '880626 1403 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1310', 'GRACE SESUFE MOEMA', '860430 0306 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1311', 'MANKONG MOTLATJO MAESELA', '941227 0476 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1312', 'D J NKADIMENG', '', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1313', 'KANYANE PAULINE NKADIMENG ’n.O.', '610716 0571 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1314', 'MATSOBANE WILLIAM MAHLAELA ’n.O', '770808 5843 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1315', 'RAMAESELE DORIS NKADIMENG', '620912 0932 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1316', 'RAMOLETSI SARAH MAKGOPA', '581221 0277 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1317', 'MBONGENI KEVIN MTSWENI', '980804 5538 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1318', 'DOCTOR BAFANA MASILELA', '810304 6067 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1319', 'THEMBA IVEN MALATJI', '850102 5503 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1320', 'NASSAR SIZIBA', '004440414', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1321', 'WINNIE MMABOGOSHI MNKABA', '590128 0820 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1323', 'BOTSHEKATE JULIA MKHABELA', '551104 0437 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1325', 'MARY-ANN MOTSHIDISI BOROKO', '770908 0463 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1326', 'SIBONGILE PRETTY SKOSANA obo MINOR', '730525 0965 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1327', 'PEDRO AMBROSIO MACUACA', '680905 6074 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1328', 'IDAH KGOMOKATHIMELA NKADIMENG', '830823 1666 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1329', 'ELSABE VENTER', '570328 0055 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1330', 'MOTON FRANS MATLALA', '730630 5587 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1331', 'NTSAKU SILAS PUOANE', '671025 5537 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1332', 'MARTINA TJALE', '910721 0694 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1333', 'KOMANE ABRAM MOHLAMONYANE', '550527 5292 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1335', 'LEON KATEKANE TSHABALALA', '940122 5519 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1337', 'VAUGMAN GILCHRIST', '931214 5165 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1338', 'MASIWA JOYCE MONAGENG', '720314 0871 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1340', 'TERTIA MMASELLO RAMPHISA', '970902 0427 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1342', 'HLOKOTSE ELIZA MAMETJA', '760424 1038 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1343', 'LUCKY MATLALA', '890620 5510 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1344', 'PROSPER TLAILANE', '030523 6004 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1345', 'DANIEL FENYANE MBETHE', '620219 5410 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1346', 'ELPHAS MAPHOSA', '800520 6208 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1348', 'KUTWADI E MAROTA', '740219 0410 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1351', 'JOHANNAH LINNAH MTSWENI', '781203 0712 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1352', 'POLOKWANE JOHANNES KGORI ’n.O.', '560421 5513 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1354', 'MAMORAKA APHANE', '920116 1337 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1355', 'VERONICA MALETJEPE MOGAJANA', '890725 1018 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1356', 'MABEL TABEA PHATLANE', '710624 0378 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1358', 'MALESELA COLLEN LEDWABA', '860606 6409 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1359', 'MOLOGADI KUTU', '000315 0917 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1361', 'MATSHEHLA VERGINIA KEKANA', '030314 0491 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1363', 'ROBERT MODISHA', '8200519 5336 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1365', 'LEKATE MANTLA MAHLABA', '690819 0338 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1366', 'NOLYNE KEDIBONE MOLEBALWA', '861127 1247 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1367', 'GABAATHLOLWE PHANUEL DILA', '890114 6057 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1368', 'VIOLET MATEPE RANGOANASHA OBO H', '861010 2295 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1369', 'VOILET MATEPE RANGOANASHA', '861010 2295 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1370', 'ROSE MOKGADI RANGOANASHA obo M', '900829 0967 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1371', 'SARAH LEBOGO', '890902 1043 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1372', 'BUSHY RAMODIKWE MASEMOLA', '000506 5588 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1373', 'MV MATLEJOANE obo AMOGELANG SEKATI', '060609 6258 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1374', 'DEON RANALA', '020103  5928 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1375', 'KGOTLELELO TRPTT SEPADI TOLAMO', '000204 5258 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1376', 'DIRK JACOBUS PIENAAR', '780705 5075 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1377', 'ALPHEUS THAPEDI NKOANA', '930313 6010 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1379', 'PUSELETSO MANALA', '980419 5450 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1380', 'MATSELENG OLIVIAH SEKGATHUME', '800501 0391 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1381', 'GODFREY CHRISTIAN TJIANE', '781225 5761 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1382', 'ROBERT MODISHA', '800519 5336 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1383', 'MAGWANE MARIA MADILENG', '580508 0390 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1385', 'MATHABATHE ELIZABETH MAGANE obo B', '590827 0480 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1386', 'PETROS SPHIWE MAHLANGU', '850113 5710 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1387', 'VICTOR MOGANEDI', '990627 5480 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1388', 'LEFALANE REFILWE MASEMOLA', '700612 0837 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1389', 'SEKATLUDI ZACHARIA MAGAHLE', '740203 6298 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1390', 'DANIEL MATSOLANE TLAKA', '740221 5504 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1391', 'PONTSHO VINCENT MOHLALA', '930616 6371 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1392', 'KABELO MOHLALA', '001210 5560 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1393', 'KOBODI KUTAMA', '910916 6367 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1394', 'JOSIAS THATEDI MADUBANYA', '940320 5962 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1395', 'ELIZABETH SADI MOGOLA', '580422 0499 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1397', 'PETRICK NGOEPE', '900801 5687 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1398', 'ELVIS THATO MALATSI', '011202 5837 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1400', 'MOKWETE REUBEN CHOGA', '760811 6503 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1401', 'NTALE SHILA MOTJEDI', '771210 0390 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1402', 'JOYCE FANISILE MATSHIKA OBO ’n', '800728 1111 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1403', 'JOYCE FANISILE MATHSIKA', '800728 1111 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1406', 'DAVID TAOLANE MAEPA', '620318 5772 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1409', 'KEITUMETSE MAGANEDISA', '941107 5792 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1410', 'MOGAU MALATJI', '940809 5875 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1411', 'ABEGALE MPHO MARAKALLA', '960802 0695 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1412', 'MAMMA MARTHA MASEEMA', '741127 0624 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1413', 'POSIS WILLY MOTHUPI', '830901 6234 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1414', 'MARIA MAFOLE RANKWE', '870925 1421 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1415', 'MARTHA THEMBI JIAYNE', '810901 0685 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1416', 'MARTHA NOMQIBELO SKOSANA', '640718 0371 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1417', 'NTSWAKI MMAID MAKEKE', '780202 2204 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1418', 'TSHWARELO CHARLOTTE MADITSI', '940620 0437 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1419', 'LEAH MALITSATSI MABULA', '890426 0350 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1421', 'ANDRE Manuel CHILANGO', '770520 6050 186', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1422', 'MPHO ZELDAH MAHLASE', '971115 1108 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1423', 'SINDY NELLY SELOMA', '940423 0428 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1424', 'MASEEPE MAHLATS KATE MALEKA', '880917 0675 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1425', 'SINDY NELLY SELOMA', '940423 0423 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1426', 'MPHUPHUTSENG MAGATALENG DIALE', '971113 0462 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1427', 'KGATHANE FRANCINAH SHOKWANE', '660505 0600 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1428', 'BAKGOPI GLORIA DOLAMO', '850408 0813 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1429', 'MERCY TAPFUMA', 'FN637254', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1431', 'MASEKOPO MICHAEL MATLALA', '441115 5126 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1432', 'MOGOLE TINNY MANANYETSO', '570922 0760 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1433', 'CHANCHE EDWARD MATLALA', '490222 5589 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1434', 'RAMPATI ANGELINA MASHIPANE', '580225 0234 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1435', 'MADINOGE FELISTAS MANASOE', '581222 0357 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1436', 'JOSEPH THABO MAGEDI', '000218 6238 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1437', 'MANI ALICE MORELE', '740805 0750 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1438', 'MATSELENG OLIVIAH SEKGATHUME', '800501 0391 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1439', 'MICHAEL NQOBILE KABINI', '791129 5827 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1440', 'DEHNIA RABASIANG PHAHLAMOHLAKA', '930416 0683 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1441', 'THABANG GOODNESS NKADIMENG', '880310 6591 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1443', 'SONIA TISSO MABUNDA', '30MC23704', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1444', 'DELEELE MBEWE', '651228 0823 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1445', 'BABY THABISILE APHANE', '890924 1101 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1446', 'NTOMBI PRETTY MASANGO', '891028 1072 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1447', 'PUSELETSO MORSHADI LEDWABA', '911230 1246 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1448', 'JABU FANNY MATJEA', '790617 5673 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1449', 'JEPHIAS MARISA', '03. 09. 1996', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1450', 'TOBIAS CHITAMBIRA', 'EXT 6 MARBLE HALL', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1451', 'EDWARD MONDERA', '22-325303 H 22 CIT M', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1452', 'MENSON MACHONA', '54-128506G-03', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1453', 'KKEDIBONE SEAGA MONAMA', '780904 1073 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1454', 'PIET MASHABANE', '831229 5488 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1455', 'MMATOMO DAMARIES NDLOVU', '850408 0308 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1457', 'MONYELAKA ESTHER MAWELA', '860312 1019 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1458', 'TSITSI MAVIS MANDAVA', 'FN230483', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1459', 'NESMA MASHIANOKE SELOMA', '901029 0954 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1460', 'MOYAHABO PETRUS SEKOADILE', '901231 5587 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1461', 'MOLEBALENG SILAS MOHLALA', '780215 5766 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1463', 'ELIZABETH BALOYI', '30MC05308', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1465', 'MAVIS MANKATI CHOEU', '761010 0814 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1466', 'THAKGODI ROEDTAN MAIMELA', '550909 0324 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1467', 'MATALA JOSEPH MAIMELA', '500502 5621 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1468', 'Paul MMUSI SELEPE', '591125 5390 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1469', 'ALFEU ALFIADO NGANICO', 'AB2772648', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1470', 'MOGAU JOHANNES MAPHANGA', '860719 5911 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1471', 'SELINA MMKOMA MAGAELA', '820428 0638 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1472', 'TEBALELO SARAH MASHIANE', '900817 1022 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1473', 'SEDIKANA YVONNE SELOANE', '830302 0998 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1474', 'THABISO KOMANE MOHLAMUNYANE', '930803 5606 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1475', 'BONGINKOSI ROBERT NKOSI', '880703 5997 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1478', 'MICAS RAUL CUMBI', '30MA90360', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1479', 'TSHEPO JAFTA RAHLOGO', '911122 5462 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1480', 'AGOSTINO AALEXANDRE BANGUINE', 'AB0868505', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1481', 'GLADYS LEFAO obo F', '870527 1038 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1482', 'MATLABANE EDWARD MALOPE', '800420 5264 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1483', 'MALEGODI JONAS MOHLAHOLE', '560627 5436 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1484', 'LETICHA van Staden', '980107 0159 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1485', 'GERT HENDRICUS van der Walt', '981019 5064 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1486', 'CALADO MANUEL CUMBANE', '30MC15557', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1487', 'FRANCINA CHABALALA', '921223 0991 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1488', 'MATHOPE DECEMBER MANYAKA', '881225 7114 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1489', 'BONGANI PHILLEMONE MOFULENE', '920125 5596 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1490', 'THEMBISILE MORANAGA', '60306 1141 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1492', 'RAKGANYANE TETELO MAELANE', '860319 0986 013', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1493', 'CIDALIA PEDROS MABOTE', '30MA97007', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1494', 'DUMISANI JOHANNES MBONANI', '700320 5476 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1495', 'JONAS RANALA', '930204 5365 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1496', 'JOHANNES MARTHINUS-JACOB  WOEST', '720824 5253 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1497', 'MASEFAKO ANSIE MAHLARE', '711224 0339 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1498', 'TUBAKE SHIRLEY MAEBANE', '830601 0864 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1499', 'MANKATE GRACE BOGOPA', '740818 0700 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1500', 'KHOMOTSO ITUMELENG KGOPE', '920520 5328 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1501', 'MAJENG ELIAS SHAKOANE', '730802 5835 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1502', 'CATHERINE NTOKOZO MATHIBELA obo S', '880104 0762 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1503', 'MOKGALE FRANK MMAKUBJANE', '550620 5706 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1505', 'JOSEPH MOKIE KHUMALO', '670310 5640 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1506', 'STANLEY MOLOTO', '930326 5611 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1507', 'NOMSA SITHOLE', '791125 0588 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1508', 'BRENDA NCHABELENG', '850828 0386 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1509', 'MABALANE EDWIN MMAMUSHI', '681011 5583 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1510', 'MATSAPOLA ENGELINA SATHEKGE', '640727 0516 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1511', 'MOKIBELO CATE MADISHA', '580929 0307 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1512', 'NOMTHANDAZO CONSTANCE THUBANE', '790607 0539086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1513', 'MORONGWE ELIZABETH MALAU', '580519 0263 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1514', 'SABINA SEGOKODI', '881201 0346 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1515', 'SAMUEL MAPITLE SELOANE', '850110 6034 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1516', 'MOKAU STEPHEN MASEMOLA', '730923 5426 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1517', 'TUDA JOHANNA LESUFI', '631001 0534 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1519', 'CATHERINE THANDO MTSWENI obo K', '861119 0906 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1520', 'POKALA ALBERT MAKOLA', '980726 5780 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1521', 'JOSEPHINA MAMASELA MAKHUDU', '660923 0408 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1522', 'LEBOGANG NTSHEHI', '930307 0445 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1523', 'POPPY LLENDRA SKOSANA', '920814 0445 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1524', 'COLLIA ELIZABETH VELDMAN', '731017 0086 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1526', 'SYDNEY OUPA MATSHA', '871026 5832 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1527', 'TEBOGO LEKGAU', '040104 5075 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1528', 'TSHIDISO LEKGAU', '010402 6167 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1530', 'SOLLY MAMPHO', '830517 5750 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1531', 'MAVHEGO OLGAH MALESOENE', '780422 0331 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1532', 'NALEDI MAGAELA', '030513 0709 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('LT1533', 'ANGELINE SINDANA', '870506 0387 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1534', 'FEZILE MAMPANE', '931011 5783 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1536', 'THAANE ISAAC NCHABELENG', '861018 5435 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1537', 'KGOLOKO DAVID MATLOU', '561023 5254 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1538', 'CARLUS MUTUQUE', '740604 6728 186', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1541', 'ELLA MATHIBELA CHUKUDU', '890612 0884 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1542', 'DUMISANI JIYANE', '910612 1265 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('LT1543', 'SIPHO GODFREY NKOSI', '750629 5414 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1546', 'SEEMOLE ELIZABETH NGAKA', '660404 0930 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1547', 'JOHANNES RAKGALAKANE', '970621 5745 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1548', 'KENNETH HAPPY MBI', '780902 5806 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1550', 'MARIA MALESELA MAMPANA', '840929 1182 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1551', 'MANDLA MAKUWA', '000506 5259 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1552', 'WILLIAM FIVE MASEMOLA', '890514 5468 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1555', 'GIRLY MOLOGADI MAPHOPHA obo H', '800406 1075 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1556', 'MAURINE NTOMBI MAVUSO obo M', '900508 0971 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1557', 'ROOI SANKUBETSA MOHUBA', '640826 5606 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1558', 'RAMOLOKWANE ROSINAH KOTOLO', '791028 1009 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1559', 'MAGALANE MMAKOLA', '751128 0664 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1560', 'PATRICK MAGOPE LERABANE', '740118 5396 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1561', 'MAHLAKO MAVIS LEGWABE', '790810 0646 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1562', 'PHOSHOKO RONNY MAROGA', '971117 6221 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1563', 'JACOB MAHUBEDU MOLOTO', '770210 5592 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1564', 'SEWELA WINNIE MOLEMANA', '821225 1046 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1565', 'RONNY MOKGUBI MANALA', '891028 5337 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1566', 'NTHABISENG PRIZIL NKGADIMA', '710513 0534 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1567', 'YVONNE MAGETLE LETSHEDI', '881028 0976 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1568', 'MAPULE JOHANNA MAKITLA', '601102 0913 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1569', 'RAESIBE AANNETJIE MOWA', '820901 1164 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1570', 'CHRISTINA NOMPUMELELO NTULI', '790717 0441 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1571', 'CEDRICK MAPUTU LENTSWANE', '861212 6781 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1572', 'LLINAH MATHABATHE BAPELA', '930514 0882 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1573', 'MMAMOREKE REGINAH MOABELO', '830326 1287 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1575', 'TAVONGA TOMU', 'FN524081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1576', 'MASHIENYANE MEISIE TLADI', '750214 0432 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1578', 'ISSAC KULE SINDANE', '661008 5530 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1579', 'TSHOGISHI PATRICK MATLOU', '850831 5963 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1580', 'JOYCE DIMAKATSO MOKOENA', '740425 1071 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1582', 'TLHAPHI LEAH RAKGOLELA', '941016 0277 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1583', 'SETH SHIKWANE PALEDI', '670601 3304 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1584', 'TOKELO IINNOCENT MATLALA', '950518 5783 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1585', 'MASHEGWANYANE MODIEGI MAIBELO', '871215 5870 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1586', 'ESTHER SEKE MAAKO', '650414 0375 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1587', 'SARUDZAI ROCHENY CHIVANDI', '63-2780167D-07', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1588', 'PETER KAGISO MASETLOA', '840118 5950 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1589', 'CONSTANCE  MANTWA MOLALA obo H', '750902 0376 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1590', 'PINAH MAMOTENTE MAMOGOBO', '651004 0683 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1592', 'PERTUNIA NOKUTHULA MZIMBA', '821202 0840 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1593', 'MBUSENI VUSI SKHOSANA', '000717 5623 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1594', 'LAZARUS MAISELA', '850515 6214 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1595', 'ROSIE MALEHU MAMAKOKO', '780303 0564 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1596', 'WENDY NOKWAZI MASOKA obo MINOR', '870708 0736 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1597', 'TEBOGO NGWATO MANTSIE', '950311 5847 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1598', 'SINAZO KOLOBILE', '920924 1619 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1599', 'MUNYEZWA JOHANNES MASOMBUKA', '630313 5809 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1600', 'RONNY MXONGO', '810302 6419 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1601', 'BUSISIWE EEMILY MAHLANGU', '770328 0455 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1602', 'NGWANAMASHEGWANA FLOAH MOHLALA', '750119 0484 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1603', 'MANUMES PAULO VILANCULO', 'AB2758057', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1604', 'THOMAS ALEXANDRE MUDEME', 'AB2758082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1605', 'JAN BLACK APHANE', '720205 5873 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1606', 'MALESO ESTER MATJILA', '790212 0811 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1607', 'MBONGENI JACOB MAHLANGU', '010113 5675 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1608', 'L RABALAO', '880503 0706 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1609', 'FRANK MATSOBANE SEBANYA', '040330 6139 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1611', 'ANDREW JAN MNISI', '980617 6046 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1612', 'LEFENTSE MOHLALA', '870621 0564 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1613', 'MOSA CORNELIOUS MALATJI', '950910 6154 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1614', 'LESHAKE JOHANNES MATJANELA', '980405 5639 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1615', 'RAMATSEMELS FRIDAH MAMPURU', '730920 0920 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1616', 'LEFENTSE MOHLALAN OBO', '870621 0564 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1617', 'CAROLINE NKWANA', '860923 0880 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1618', 'KENNETH SITHOLE', '920322 5842 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1619', 'KWAWANE PHYLLY MAIBELO', '820722 5491 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1620', 'MATHOKE DOCTOR RANALA', '810319 5769 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1621', 'MARGARET TEMMY MMADI', '820909 1558 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1622', 'SHAKWANE FREDDY MAELANE', '780614 5742 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1623', 'PHILLIP MASANGO', '670512 5444 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1624', 'RIBECCA BOSHIYELO', '700630 0799 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1626', 'BUITOMELE NAS MASANGO', '030512 5828 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1627', 'SUZAN THOKO NKOSI', '710618 0287 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1628', 'MAGASE WILLIAM KUTUMELA', '711215 5594 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1629', 'NOSISA ANNA MANZI', '660701 0783 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1630', 'VUSANI ROBERT NONJOJO', '920914 6607 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1631', 'THABO JOHANNES MANGESI', '800215 5694 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1632', 'ELVIS MATHEBULA', '960202 6476 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1634', 'AMOS GIDEON SEEMISE', '690302 5948 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1635', 'RICARD NGOBESE', '680607 5291 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1636', 'YUNA HLUPHI KUMAKO', '890422 0731 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1637', 'SIFISO DESIRE MNGOMEZULU', '840622 6288 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1639', 'CIEZZEL PHOMELELO MODENE', '990627 0422 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1640', 'LINDIWE KGOMOTSO PHAHLANE', '940201 0256 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1641', 'EMMAH WELHELMINAH MAKOAH', '831010 1405 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1642', 'BRIAN KUTA SEKGOBELA', '920506 6123 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1643', 'JOSEPH BIRINDWA CHENTWALI', 'DBNC0D001500811', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1644', 'MOTLATSI SIMON RAITHOLE', '870205 6281 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1647', 'NOKUTHULA VUYISILE MALANDULE', '790323 0480 000', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1648', 'JACOB JABULANI VILAKAZI', '900601 5352 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1649', 'NOMPUMELELO NAPOLINAH NKABINDE', '910727 0162 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1650', 'KGOTSO MATHEGA', '010416 5159 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1651', 'BANDILE THANDO BALOYI', '040301 5345 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1652', 'VUYISWA LWANA', '800129 0751 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1653', 'ZAKHELE JOHN MASANGO', '740724 5355 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1654', 'SHARON NOKUTHULA OBO LESEDI NHLEZA', '850211 0348 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1655', 'SUZAN OBO MBALENHLE LEOPENG', '850412 1376 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1656', 'MOILOA JACOB MATSHANE', '640422 5727 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1657', 'NKOSINATHI GLADMAN MAJOLA', '890212 5414 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1658', 'SONNYBOY PETER MASEKO', '791222 5134 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1659', 'MAKHOSAZANE WINLOVE MOOROSI', '831008 0605 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1660', 'KERENG IDA GALOGAKWE', '810813 0405 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1661', 'ZANDER ANDRIES DE JAGER', '020214 5074 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1662', 'GUSTAV JACOBUS DE JAGER', '990909 5050 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1663', 'SIFISO EMMANUEL JILI', '850606 6637 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1664', 'ODETTA THELE MOKOENA', '820704 0812 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1665', 'MANTWA SARAH MOELETSI', '780626 0571 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1666', 'NKELE SEKGOBELA', '960208 0869 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1667', 'SIMPHIWE EDDIE PHIRI', '930107 5589 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1668', 'MAESELA JOHANNES BOGOPA', '760316 5712 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1669', 'KATLEGO SOPHIE THIPE', '960530 0918 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1670', 'MVANGAZA JACKY MANGANYE', '890701 6053 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1671', 'ESTHER NTOMBI NCUBE', '520404 0911 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1672', 'ZANDILE MTHETHWA OBO NKOSIKHONA MTHETHWA', '821024 0844 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1673', 'NOKOLISEKO PRENCESS MAPONGWANA', '730504 0959 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1674', 'MONNAWANTWA ALFRED SEGOTSANE', '820809 5353 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1675', 'RAMASELA ROSINA  PHALA', '700725 0307 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1676', 'KABELO SITHOLE', '950625 5763 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1677', 'AMOHELANG JUSTICE HLOMELA', '18/06/1993 (024263114320)', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1678', 'LEBOGANG OBO KUTLWANO LUYANDA LEEU', '990912 1142 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1679', 'LEBOGANG LEEU', '990912 1142 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1680', 'DOROTHY RAMOGOHLA MANASOE', '730512 0689 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1682', 'SIMON MAMPANE', '961029 6100 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1683', 'MOKGADI PAULINE MOKWELE', '020520 0375 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1684', 'MMAKGWALE CONSTANCE LEKGOLO obo KOKETSO LEKGORO', '840108 0637 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1685', 'RABOKALE FLORENCE KUPA', '770626 0252 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1686', 'MORNE KEVIN ROSSOUW', '020531 5125 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1687', 'AGAIN KARABO obo TSHEPO SILVESTER MOUKANGOE', '701113 0614 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1688', 'THABANG PAULOS PHASHA', '991107 5518 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1689', 'ANDILE WILLETH MBUYISA', '060321 5920 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1690', 'PEDROS CONSTANTINO NOTICO', '800417 5573 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1691', 'THABISO JOSHUA MABUSE', 'RD096155', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1692', 'COHEN LUBISI', '920806 5830 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1693', 'SAUGINA PEDRO MAZIVE', 'AB1513056', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1694', 'LEBOGANG ERNEST TSUKUDU', '851003 6333 086', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1695', 'SARAH NJEPENG MOHLALA', '720103 0691 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1696', 'RHULANI METTHEWS  KHOSA', '790909 5682 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1697', 'IRENE MASWANGANYI', '808604 0180 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1698', 'SABELO INNOCENT MBATHA', '920629 6047 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1699', 'KGOSIETSILE GERALD MOROMETSI', '990303 5250 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1700', 'ERICK KOPANO MANOTWANE', '980402 5178 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1701', 'EDWIN MAHLATSI MANOTWANE', '930401 5413 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1702', 'JULY SONNY MAKHAFOLA', '850712 6026 083', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1703', 'CALVIN MARANKU MOGADIMA', '960518 6044 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1704', 'MPHO KHUMALO', '821001 5421 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1705', 'SIBUSISO FLOYD DIBA', '891007 5219 081', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1706', 'BOTIKI KOBI', '901016 5818 089', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1707', 'ANDRE NIEMAND', '780302 5038 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1708', 'KGOTHATSO MAILA', '871021 5408 085', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1709', 'SABELO MCHUNU', '891106 6179 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1710', 'MARGARET OLEBOGILE  obo KAMOGELO EDITH KAPIRI', '770714 0783 088', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1711', 'SESONA MSELE', '030527 6073 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1712', 'KARABO TEBOHO MBELE', '020104 5436 080', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1713', 'LINDIWE CHRISTINA VAN ROOYEN OBO DIMAKATSO CASSIDY NKOSI', '701202 0745 087', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1714', 'SAMUEL BUTI MADISHS', '801231 5300 084', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

INSERT INTO public.cases (case_number, title, id_number, branch, status, client_id)
VALUES ('L1715', 'LEBOGANG RONALDO MADISHA', '060417 6396 082', 'marble-hall', 'consultation_complete', NULL)
ON CONFLICT (case_number) DO UPDATE SET title = EXCLUDED.title, id_number = EXCLUDED.id_number, branch = 'marble-hall';

COMMIT;
