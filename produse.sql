DROP TYPE IF EXISTS categ_produs;
DROP TYPE IF EXISTS locatie_plantare;

CREATE TYPE categ_produs AS ENUM('plante roditoare', 'bulbi', 'trandafiri', 'plante ornamentale', 'plante aromatice');
CREATE TYPE locatie_plantare AS ENUM('ghiveci interior', 'ghiveci exterior', 'gradina');

CREATE TABLE IF NOT EXISTS produse (
	id serial PRIMARY KEY,
	nume VARCHAR(50) UNIQUE NOT NULL,
	descriere TEXT,
	imagine VARCHAR(300),
	categorie categ_produs,
	locatie_de_plantare locatie_plantare DEFAULT 'gradina',
	pret NUMERIC(8,2) NOT NULL,
	cantitate_in_pachet INT NOT NULL CHECK (cantitate_in_pachet>0),
	data_adaugare TIMESTAMP DEFAULT current_timestamp,
	conditii_de_lumina VARCHAR(15),
	timp_de_plantare VARCHAR[],
	comestibil BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO produse (nume, descriere, imagine, categorie, locatie_de_plantare, pret, cantitate_in_pachet, conditii_de_lumina, timp_de_plantare, comestibil) VALUES
('Goji','Cele mai sănătoase fructe, bogate în vitamine și antioxidanți.','goji.jpeg','plante roditoare','gradina',32.9,1,'soare','{"martie-noiembrie"}',true),
('Mur','Mur fara spini in ghiveci','mure.jpeg','plante roditoare','gradina',30,1,'soare','{"martie-noiembrie"}',true),
('Alun','Arbust voluminos, cu multe ramificatii','alun.jpeg','plante roditoare','gradina',28,1,'semiumbra','{"martie-noiembrie"}',true),
('Zmeur','Zmeur fara spini','zmeur.jpeg','plante roditoare','gradina',30,1,'soare','{"martie-noiembrie"}',true),
('Trandafir Meilland Ines Sastre','Trandafir catarator la ghiveci','trandafir_catarator.jpeg','trandafiri','gradina',49,1,'soare','{"martie-noiembrie"}',false),
('Trandafir Rose de Rescht','Trandafir pentru dulceata','trandafir_dulceata.jpeg','trandafiri','gradina',20,1,'soare','{"februarie-mai","septembrie-decembrie"}',true),
('Trandafir Sunshine babylon Eyes','Trandafir tarator','trandafir_tarator.jpeg','trandafiri','gradina',31,1,'soare','{"februarie-mai","septembrie-decembrie"}',false),
('Trandafri Aquarell','Trandafir teahibrid parfumat','trandafir_parfumat.jpeg','trandafiri','gradina',41,1,'soare','{"februarie-mai","septembrie-decembrie"}',false),
('Crin Friso','Crin oriental deosebit de aspectuos','crin.jpeg','bulbi','gradina',19,2,'soare','{"martie-aprilie","septembrie-decembrie"}',false),
('Leandru roz','Planta decorativa, vesnic verde, cu aer mediteranean','leandru.jpg','plante ornamentale','ghiveci exterior',48,1,'soare','{"aprilie-iunie"}',false),
('Hortensie albastra','Produce globyri voluminoase de flori, in nuanta intensa de albastru','hortensie.jpg','plante ornamentale','gradina',32,1,'umbra','{"martie-noiembrie"}',false),
('Iedera','Ideala pentru acoperirea zidurilor, pergolelor sau a gardurilor','iedera.jpeg','plante ornamentale','gradina',29,1,'umbra','{"martie-noiembrie"}',false),
('Lavanda','Planta perena parfumata','lavanda.jpeg','plante aromatice','gradina',15,1,'soare','{"martie-noiembrie"}',false),
('Aloe vera','O farmacie la ghiveci!','aloe.jpeg','plante aromatice','ghiveci exterior',55,1,'soare','{"martie-noiembrie"}',true),
('Oregano','Condiment in bucataria italiana','oregano.jpeg','plante aromatice','gradina',14,1,'soare','{"martie-noiembrie"}',true),
('Bambus Pingwu','Planta foarte rezistenta','bambus.jpeg','plante ornamentale','gradina',69,1,'semiumbra','{"martie-noiembrie"}',false),
('Dracena mix','Planta verde care purifica aerul','dracena.jpeg','plante ornamentale','ghiveci interior',110,1,'semiumbra','{}',false),
('Limba soacrei','Sansevieria trifasciata Superba','limba_soacrei.jpeg','plante ornamentale','ghiveci interior',35,1,'semiumbra','{}',false);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iulia;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iulia;