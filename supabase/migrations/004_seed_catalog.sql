-- ============================================================
-- MIGRATION 004: SEED DO CATÁLOGO — VinhoSocial
-- Vinhos populares para popular o catálogo inicial
-- ============================================================

-- Vinhos Brasileiros
INSERT INTO public.wines (name, producer, country, region, vintage, grape_varieties, wine_type, wine_color, description, is_verified) VALUES
('Bento Gonçalves Merlot', 'Miolo', 'Brasil', 'Serra Gaúcha', 2022, ARRAY['Merlot'], 'tinto', 'tinto', 'Vinho tinto de corpo médio da Serra Gaúcha com notas de frutas vermelhas maduras.', true),
('Don Laurindo Reserva Cabernet Sauvignon', 'Vinícola Don Laurindo', 'Brasil', 'Serra Gaúcha', 2021, ARRAY['Cabernet Sauvignon'], 'tinto', 'tinto', 'Elegante Cabernet com passagem em carvalho, taninos maduros e longa persistência.', true),
('Salton Volte Seco Espumante', 'Salton', 'Brasil', 'Serra Gaúcha', 2022, ARRAY['Chardonnay', 'Pinot Noir'], 'espumante', 'branco', 'Espumante brut com perlage fino, notas de maçã verde e pão torrado.', true),
('Casa Valduga Gran Reserva Merlot', 'Casa Valduga', 'Brasil', 'Vale dos Vinhedos', 2020, ARRAY['Merlot', 'Cabernet Franc'], 'tinto', 'tinto', 'Grande reserva com 18 meses em carvalho francês. Estruturado e elegante.', true),
('Pizzato DNA99 Cabernet Sauvignon', 'Pizzato', 'Brasil', 'Vale dos Vinhedos', 2021, ARRAY['Cabernet Sauvignon'], 'tinto', 'tinto', 'Um dos melhores tintos brasileiros, com complexidade e longevidade.', true),
('Villa Lobos Chardonnay', 'Villa Lobos', 'Brasil', 'Serra Gaúcha', 2022, ARRAY['Chardonnay'], 'branco', 'branco', 'Chardonnay fresco com fermentação em inox, notas cítricas e floral.', true),
('Luiz Argenta Flor Rosé', 'Luiz Argenta', 'Brasil', 'Serra Gaúcha', 2023, ARRAY['Pinot Noir'], 'rose', 'rose', 'Rosé delicado com aromas de morango e framboesa, acidez vibrante.', true),
('Garibaldi Lorena Chardonnay', 'Garibaldi', 'Brasil', 'Serra Gaúcha', 2022, ARRAY['Chardonnay'], 'espumante', 'branco', 'Espumante método tradicional com 24 meses de autólise.', true),

-- Vinhos Argentinos
('Catena Zapata Malbec', 'Catena Zapata', 'Argentina', 'Mendoza', 2021, ARRAY['Malbec'], 'tinto', 'tinto', 'Ícone da Argentina. Malbec de altitude com frutas negras densas e especiarias.', true),
('Zuccardi Valle de Uco', 'Zuccardi', 'Argentina', 'Valle de Uco', 2020, ARRAY['Malbec', 'Cabernet Franc', 'Petit Verdot'], 'tinto', 'tinto', 'Blend de altitude, potente e elegante, com grande capacidade de guarda.', true),
('Achaval Ferrer Quimera', 'Achaval Ferrer', 'Argentina', 'Mendoza', 2020, ARRAY['Malbec', 'Merlot', 'Cabernet Sauvignon', 'Cabernet Franc'], 'tinto', 'tinto', 'Blend clássico de Mendoza, suave e equilibrado.', true),
('Luigi Bosca Malbec Reserva', 'Luigi Bosca', 'Argentina', 'Mendoza', 2021, ARRAY['Malbec'], 'tinto', 'tinto', 'Malbec tradicional com boa relação custo-benefício.', true),
('Clos de los Siete', 'Michel Rolland', 'Argentina', 'Valle de Uco', 2020, ARRAY['Malbec', 'Merlot', 'Syrah', 'Cabernet Sauvignon'], 'tinto', 'tinto', 'Projeto de Michel Rolland, um dos mais elegantes da Argentina.', true),

-- Vinhos Chilenos
('Concha y Toro Don Melchor', 'Concha y Toro', 'Chile', 'Puente Alto', 2019, ARRAY['Cabernet Sauvignon'], 'tinto', 'tinto', 'Ícone chileno, considerado um dos melhores Cabernets da América do Sul.', true),
('Almaviva', 'Baron Philippe de Rothschild + Concha y Toro', 'Chile', 'Puente Alto', 2019, ARRAY['Cabernet Sauvignon', 'Carmenère', 'Cabernet Franc'], 'tinto', 'tinto', 'Joint venture chileno-francesa. Vinho de prestígio mundial.', true),
('Santa Rita 120 Carmenère', 'Santa Rita', 'Chile', 'Rapel Valley', 2022, ARRAY['Carmenère'], 'tinto', 'tinto', 'Carmenère acessível com aromas herbáceos e frutas vermelhas.', true),
('Viña Vik', 'Vik', 'Chile', 'Valle del Cachapoal', 2019, ARRAY['Cabernet Sauvignon', 'Merlot', 'Carmenère', 'Cabernet Franc'], 'tinto', 'tinto', 'Winery de altíssimo luxo no Chile. Vinho de guarda excepcional.', true),

-- Vinhos Portugueses
('Barca Velha', 'Casa Ferreirinha', 'Portugal', 'Douro', 2011, ARRAY['Touriga Nacional', 'Touriga Franca', 'Tinta Roriz'], 'tinto', 'tinto', 'O mais icônico vinho português de mesa. Produzido apenas em anos excepcionais.', true),
('Niepoort Redoma Reserva', 'Niepoort', 'Portugal', 'Douro', 2019, ARRAY['Touriga Franca', 'Touriga Nacional', 'Tinta Roriz'], 'tinto', 'tinto', 'Douro elegante de Dirk Niepoort, com ótima acidez e frescor.', true),
('Quinta do Crasto Reserva', 'Quinta do Crasto', 'Portugal', 'Douro', 2020, ARRAY['Touriga Nacional', 'Touriga Franca', 'Tinta Roriz'], 'tinto', 'tinto', 'Clássico do Douro, encorpado e com bela estrutura tânica.', true),
('Esporão Reserva Tinto', 'Herdade do Esporão', 'Portugal', 'Alentejo', 2020, ARRAY['Aragonez', 'Trincadeira', 'Cabernet Sauvignon'], 'tinto', 'tinto', 'Alentejo robusto e frutado, excelente custo-benefício.', true),
('Dirk Niepoort Bioma', 'Niepoort', 'Portugal', 'Douro', 2020, ARRAY['Touriga Nacional', 'Touriga Franca'], 'tinto', 'tinto', 'Vinho biodinâmico do Douro com caráter e personalidade únicos.', true),

-- Vinhos Italianos
('Sassicaia 2019', 'Tenuta San Guido', 'Itália', 'Bolgheri', 2019, ARRAY['Cabernet Sauvignon', 'Cabernet Franc'], 'tinto', 'tinto', 'Super Toscano pioneiro. Um dos vinhos mais famosos do mundo.', true),
('Barolo Bussia', 'Prunotto', 'Itália', 'Piemonte', 2018, ARRAY['Nebbiolo'], 'tinto', 'tinto', 'Barolo tradicional com tâninos firmes, acidez vibrante e grande longevidade.', true),
('Amarone della Valpolicella', 'Allegrini', 'Itália', 'Veneto', 2017, ARRAY['Corvina', 'Rondinella', 'Molinara'], 'tinto', 'tinto', 'Amarone poderoso com uvas passificadas, denso e complexo.', true),
('Brunello di Montalcino', 'Biondi Santi', 'Itália', 'Toscana', 2016, ARRAY['Sangiovese Grosso'], 'tinto', 'tinto', 'A família criadora do Brunello. Vinho de grandíssima guarda.', true),
('Gaja Barbaresco', 'Angelo Gaja', 'Itália', 'Piemonte', 2018, ARRAY['Nebbiolo'], 'tinto', 'tinto', 'Modernista do Piemonte, elegante e sofisticado.', true),

-- Vinhos Franceses
('Château Margaux', 'Château Margaux', 'França', 'Bordeaux - Margaux', 2016, ARRAY['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot'], 'tinto', 'tinto', 'Premier Grand Cru Classé. Um dos vinhos mais celebrados do mundo.', true),
('Petrus', 'Château Pétrus', 'França', 'Bordeaux - Pomerol', 2015, ARRAY['Merlot'], 'tinto', 'tinto', 'Lendário vinho de Pomerol. Um dos mais raros e caros do planeta.', true),
('Domaine de la Romanée-Conti', 'DRC', 'França', 'Borgonha - Côte de Nuits', 2018, ARRAY['Pinot Noir'], 'tinto', 'tinto', 'Considerado por muitos o melhor Pinot Noir do mundo.', true),
('Cristal Champagne', 'Louis Roederer', 'França', 'Champagne', 2015, ARRAY['Pinot Noir', 'Chardonnay'], 'espumante', 'branco', 'Champagne de prestígio criado originalmente para o Czar russo.', true),
('Puligny-Montrachet Premier Cru', 'Domaine Leflaive', 'França', 'Borgonha', 2019, ARRAY['Chardonnay'], 'branco', 'branco', 'Chardonnay borgonhês mineral e elegante, referência mundial.', true),

-- Vinhos Espanhóis
('Vega Sicilia Único', 'Vega Sicilia', 'Espanha', 'Ribera del Duero', 2012, ARRAY['Tempranillo', 'Cabernet Sauvignon', 'Merlot', 'Malbec'], 'tinto', 'tinto', 'O vinho mais icônico da Espanha. Altíssima complexidade e longevidade.', true),
('Álvaro Palacios L''Ermita', 'Álvaro Palacios', 'Espanha', 'Priorat', 2019, ARRAY['Garnacha', 'Cabernet Sauvignon'], 'tinto', 'tinto', 'Garnacha velha do Priorat em terroir de ardósia. Extraordinário.', true),
('Pingus', 'Dominio de Pingus', 'Espanha', 'Ribera del Duero', 2018, ARRAY['Tempranillo'], 'tinto', 'tinto', 'Cult wine de Peter Sisseck, com produção minúscula e demanda enorme.', true),
('Rioja Imperial Reserva', 'CVNE', 'Espanha', 'Rioja', 2016, ARRAY['Tempranillo', 'Graciano', 'Mazuelo'], 'tinto', 'tinto', 'Rioja reserva clássico com ótimo envelhecimento em carvalho americano.', true);
