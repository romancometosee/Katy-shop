// Официальные фото товаров с сайтов брендов. Используются, пока в админке не загружено своё фото.
// Ключ — адрес товара (id), значение — ссылка на фото.
export const productImages: Record<string, string> = {
  "dior-sauvage-eau-de-parfum": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwb2cb1143/Y0785220/Y0785220_C099600180_E01_GHC.jpg",
  "dior-j-adore-eau-de-parfum": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dw6de3982c/Y0998031/Y0998031_C099800246_E01_GHC.jpg",
  "dior-miss-dior-blooming-bouquet": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwcbfbedd5/Y0996612/Y0996612_C099700102_E01_GHC.jpg",
  "dior-rouge-dior": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwb2e44bb1/Y0356009/Y0356009_C035600999_E01_GHC.jpg",
  "yves-saint-laurent-libre-eau-de-parfum": "https://www.yslbeautyus.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dw3cedbd53/Images2019/Libre%20Eau%20De%20Parfum/90mL/3614272648425.jpg",
  "yves-saint-laurent-black-opium": "https://www.yslbeautyus.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwf7216072/Black%20Opium%20Packshots/BO%20EDP/3365440787971.jpg",
  "yves-saint-laurent-y-eau-de-parfum": "https://www.yslbeautyus.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dw7e1a6ec4/Fragrance/727YSL/727YSL/3614272050358.jpg",
  "yves-saint-laurent-rouge-pur-couture": "https://www.yslbeautyus.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwd7bbca31/RPC%20Shade%20Extensions/3614273945554/3614273945554.jpg",
  "lancome-la-vie-est-belle": "https://www.lancome-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lancome-us-master-catalog/default/dwf8960ed7/pdp/100606/ALT0-3605533286555-PACKSHOT.jpg",
  "lancome-idole": "https://www.lancome-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lancome-us-master-catalog/default/dw03be8cb3/pdp/LAN387/ALT0-3614273069175-PACKSHOT.jpg",
  "lancome-genifique-syvorotka": "https://www.lancome-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lancome-us-master-catalog/default/dwbf722f12/pdp/1000302/Lancome-Serum-Advanced-Genifique-Microbiome-Youth-Activating-Concentrate-100ml-000-3614272623507-Front.png",
  "giorgio-armani-acqua-di-gio-profondo": "https://www.giorgioarmanibeauty-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-gab-master-catalog/default/dw4eae1912/products/2025/A2267%20RESTAGE/3614273953849_01.jpg",
  "giorgio-armani-luminous-silk-foundation": "https://www.giorgioarmanibeauty-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-gab-master-catalog/default/dw467341ed/products/makeup/ww-01019-arm_NEW/1/3614274164664.jpg",
  "maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum": "https://www.franciskurkdjian.com/dw/image/v2/BJSB_PRD/on/demandware.static/-/Sites-mfk-master-catalog/default/dwe794c594/BACCARAT_ROUGE_540/FRAGRANCE/3700559608654_BR540_EDP_35ML_1.png",
  "maison-francis-kurkdjian-otlivant-baccarat-rouge-540-10-ml": "https://www.franciskurkdjian.com/dw/image/v2/BJSB_PRD/on/demandware.static/-/Sites-mfk-master-catalog/default/dwe794c594/BACCARAT_ROUGE_540/FRAGRANCE/3700559608654_BR540_EDP_35ML_1.png",
  "maison-francis-kurkdjian-nabor-miniatyur-bestsellery-nishi-5-2-ml": "https://www.franciskurkdjian.com/dw/image/v2/BJSB_PRD/on/demandware.static/-/Sites-mfk-master-catalog/default/dw70e7f365/BACCARAT_ROUGE_540/FRAGRANCE/3700559604441_RA1CM2301_BR540_EDP_COFFRET_5X11ML_VIEW1_2000X2000.png",
  "byredo-gypsy-water": "https://www.byredo.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/8/0/806014_1_full_no.jpg",
  "byredo-mojave-ghost": "https://www.byredo.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/0/0/0065204854_1_full_no.jpg",
  "chanel-coco-mademoiselle-eau-de-parfum": "https://www.chanel.com/images//t_one/w_0.51,h_0.51,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_620/coco-mademoiselle-eau-de-parfum-spray-3-4fl-oz--packshot-default-116520-9564892495902.jpg",
  "chanel-chance-eau-tendre": "https://www.chanel.com/images//t_one/w_0.51,h_0.51,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_620/chance-eau-tendre-eau-de-toilette-spray-3-4fl-oz--packshot-default-126320-9564890562590.jpg",
  "chanel-bleu-de-chanel-eau-de-parfum": "https://www.chanel.com/images//t_one/w_0.51,h_0.51,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_620/bleu-de-chanel-eau-de-parfum-spray-3-4fl-oz--packshot-default-107360-9564894232606.jpg",
  "chanel-nabor-coco-mademoiselle-aromat-krem-dlya-tela": "https://www.chanel.com/images//t_one/w_0.99,h_0.99,c_crop/q_auto:good,f_auto,fl_lossy,dpr_1.1/w_620/coco-mademoiselle-set-eau-de-parfum-1-7-fl-oz-and-moisturizing-body-lotion-6-8-fl-oz-1pce-packshot-default-101114-9561462341662.jpg",
  "dior-nabor-sauvage-parfyum-gel-dlya-dusha": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwf78821b4/Y0996505/Y0996505_C099700043_E01_GHC.jpg",
  "tom-ford-ombre-leather": "https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T83701_2000x2000_0_3fcf6bd0-d1a4-4378-bd89-a455b4ec53f9.png?width=800",
  "tom-ford-lost-cherry": "https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T5S501_3000x3000_0.png?width=800",
  "tom-ford-tobacco-vanille": "https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T5S601_3000x3000_0.png?width=800",
  "tom-ford-oud-wood": "https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T5S301_3000x3000_0.png?width=800",
  "guerlain-mon-guerlain": "https://www.guerlain.com/dw/image/v2/BDCZ_PRD/on/demandware.static/-/Sites-GSA_master_catalog/default/dw9b71c268/01-ProductsViewer/P013139/P013139_G013138_E01_hi-res.png?sw=800",
  "guerlain-vetiver-eau-de-toilette": "https://www.guerlain.com/dw/image/v2/BDCZ_PRD/on/demandware.static/-/Sites-GSA_master_catalog/default/dw08f1a697/01-ProductsViewer/P030486/P030486_G030486_E01_hi-res.png?sw=800",
  "creed-aventus": "https://static.thcdn.com/productimg/original/12870029-4495381423082822.jpg",
  "le-labo-santal-33": "https://lelabo.ips.photos/lelabo-java/images/skus/050PS33100__PRODUCT_01--IMG_1200--SANTAL33-200129705.jpg",
  "le-labo-another-13": "https://lelabo.ips.photos/lelabo-java/images/skus/050PA13100__PRODUCT_01--IMG_1200--ANOTHER13--122019503.jpg",
  "ex-nihilo-fleur-narcotique": "https://cdn.shopify.com/s/files/1/0873/6250/3001/files/w-ex-nihilo-fleur-narcotique-eau-de-parfum-100ml.png?width=800",
  "escentric-molecules-molecule-01": "https://www.escentric.com/cdn/shop/files/M01_100ml_Solo_St_On_Bottle_OnBaseLine.jpg?width=800",
  "juliette-has-a-gun-not-a-perfume": "https://us.juliettehasagun.com/cdn/shop/files/03_Not_A_Perfume_Packshot_bestseller_200ml_fcfa45e3-d48a-431b-9ecf-0962fa34460d_1000x1000_crop_center.jpg",
  "montale-roses-musk": "https://www.montaleparfums.com/815-product_square/roses-musk-rose.jpg",
  "la-roche-posay-hyalu-b5-syvorotka": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-acd-laroche-posay-master-catalog/default/dw371a217a/img/hyaluB5serum/50ml/Hyalu_B5_50ml_SuractivatedSerum-1500x1500-shadow.jpg?sw=800",
  "la-roche-posay-effaclar-gel-ochishchayushchiy": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-acd-laroche-posay-master-catalog/default/dw5a856f03/img/effaclargelcleanser/effaclar-facial-wash-for-oily-skin-3337872411991-1.jpg?sw=800",
  "la-roche-posay-toleriane-caring-wash": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-acd-laroche-posay-master-catalog/default/dw6eebc922/img/tolerianepurifyingfoamingfacialwash/LaRochePosay-Product-Toleriane-Toleriane-Purifying-foaming-cleanser-OLD-PACK-400ml-3337875545822-ATFPackshotFront-1500x1500.jpg?sw=800",
  "la-roche-posay-anthelios-uvmune-400-spf50": "https://www.laroche-posay.co.uk/dw/image/v2/AAQP_PRD/on/demandware.static/-/Sites-lrp-ng-master-catalog/default/dw1858f52f/LRP_Product/Anthelios/3337875797597_Anthelios-UVMune-400-Invisible-Fluid-SPF50%2B-Sun-Cream_50ml_01_La-Roche-Posay.jpg?sw=800",
  "caudalie-beauty-elixir": "https://caudalie-americas.imgix.net/media/catalog/product/1/_/1_beauty_elixir_edb_2_caudalie_packshot_offwhite_travel-size_1__1.jpg?w=800",
  "caudalie-maska-vinosource-hydra": "https://caudalie-americas.imgix.net/media/catalog/product/v/i/vinohydra_mask_packshot_offwhite_2025.jpg?w=800",
  "estee-lauder-advanced-night-repair": "https://www.esteelauder.com/media/export/cms/products/640x640/el_sku_PG5001_640x640_0.jpg",
  "charlotte-tilbury-pomada-matte-revolution-pillow-talk": "https://images.ctfassets.net/wlke2cbybljx/yzPiKmO3rZrRUPhTlxJlm/eeaab999f808fc600073d361c74da60a/039_220107_PILLOW_TALK_PLUMP_P_MATTE_REV_MEDIUM_OPEN_RJ_2402.png?w=800",
  "charlotte-tilbury-paletka-teney-pillow-talk": "https://images.ctfassets.net/wlke2cbybljx/AsVqDlt8VJEgNYQgGKFcx/2d9d309ef480f681b94889d760c87686/luxury-palette-pillow-talk-packshot.png?w=800",
  "charlotte-tilbury-haylayter-hollywood-flawless-filter": "https://images.ctfassets.net/wlke2cbybljx/38vjqfqZ4XTwyKvxeLgDmf/76078b0113c8209ebd094728ea872c77/HFF-PACKSHOT-OPEN-4.png?w=800",
  "benefit-gel-dlya-brovey-gimme-brow": "https://www.benefitcosmetics.com/dw/image/v2/BKFV_PRD/on/demandware.static/-/Sites-bencos-master-catalog/en_US/dwdd19bb17/product_images/GIMMEBROW/Main_full_gimmebrow.jpg?sw=800",
  "benefit-tush-they-re-real": "https://www.benefitcosmetics.com/dw/image/v2/BKFV_PRD/on/demandware.static/-/Sites-bencos-master-catalog/default/dwd92194a4/product_images/TARMAGEM65/Main_full_theyrerealmagnet.jpg?sw=800",
  "kerastase-elixir-ultime-shampun": "https://www.kerastase-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-kerastase-master-catalog/default/dw262bcec1/2018/Full-Size/Elixir-Ultime/Renovation/kerastase-elixir-ultime-le-bain-shampoo.png?sw=800",
  "kerastase-elixir-ultime-l-huile-originale": "https://www.kerastase-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-kerastase-master-catalog/default/dw055224e9/2024/ELIXIR-REVAMP/dmi-update/KER_ELIXIR_24_PACKSHOT_75ML_lhuile-original-hair-oil-refillable-for-hair-shine_V2.jpg?sw=800",
  "olaplex-no-4-bond-maintenance-shampoo": "https://cdn.shopify.com/s/files/1/0434/1661/files/2026_No4_250ML_Product_Packshot_01_GBL_1440x1440_1.png?width=800",
  "olaplex-no-3-hair-perfector": "https://cdn.shopify.com/s/files/1/0434/1661/files/2025_No3PLUS_100ml_Product_Packshot_01_GBL_1440x1440_4a07d1c4-9b45-4388-bba2-58f689c96985.png?width=800",
  "sol-de-janeiro-dymka-dlya-tela-cheirosa-62": "https://cdn.shopify.com/s/files/1/2826/2250/files/01_SDJ_PPage_DTC_C62_240ML_OVERHEAD_RGB_1452X1452_222bd1a6-2a46-4d97-9101-d4c20edacc6c.jpg?width=800",
  "sol-de-janeiro-krem-dlya-tela-brazilian-bum-bum": "https://cdn.shopify.com/s/files/1/2826/2250/files/01_SDJ_PPage_DTC_BB_BC_240ML_OVERHEAD_RGB_1452X1452_cb5b3d96-578a-4163-8c34-8c815fc465eb.jpg?width=800",
  "moroccanoil-maslo-moroccanoil-treatment": "https://cdn.shopify.com/s/files/1/0735/2582/1755/files/153_TREATMENT_ORIGINAL_100mL_v2_237139c5-fb67-4169-89c4-6a6adfbb7b0b.jpg?width=800",
  "moroccanoil-sprey-dlya-obema-volumizing-mist": "https://cdn.shopify.com/s/files/1/0735/2582/1755/files/108_STYLE-FINISHER_VOLUMIZING-MIST_160mL_v2_de10bb61-2928-4107-842f-2a176f1525bf.jpg?width=800",
};

const pick = (...ids: string[]) => ids.map((id) => productImages[id]).filter(Boolean);

/** Фото для плиток разделов (главная и меню): 3 товара раздела */
export const categoryImages: Record<string, string[]> = {
  parfyumeriya: pick("chanel-coco-mademoiselle-eau-de-parfum", "maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum", "dior-sauvage-eau-de-parfum"),
  "uhod-za-licom": pick("la-roche-posay-hyalu-b5-syvorotka", "estee-lauder-advanced-night-repair", "caudalie-beauty-elixir"),
  makiyazh: pick("yves-saint-laurent-rouge-pur-couture", "charlotte-tilbury-paletka-teney-pillow-talk", "benefit-tush-they-re-real"),
  volosy: pick("olaplex-no-3-hair-perfector", "kerastase-elixir-ultime-l-huile-originale", "kerastase-elixir-ultime-shampun"),
  telo: pick("sol-de-janeiro-dymka-dlya-tela-cheirosa-62", "sol-de-janeiro-krem-dlya-tela-brazilian-bum-bum"),
  nabory: pick("dior-nabor-sauvage-parfyum-gel-dlya-dusha", "chanel-nabor-coco-mademoiselle-aromat-krem-dlya-tela", "maison-francis-kurkdjian-nabor-miniatyur-bestsellery-nishi-5-2-ml"),
};

/** Фото для баннеров на главной, если у баннера нет своей картинки (по теме баннера) */
export const bannerImages: Record<string, string[]> = {
  noir: pick("tom-ford-oud-wood", "maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum"),
  rose: pick("chanel-chance-eau-tendre", "dior-miss-dior-blooming-bouquet"),
  gold: pick("chanel-nabor-coco-mademoiselle-aromat-krem-dlya-tela", "dior-nabor-sauvage-parfyum-gel-dlya-dusha"),
};

/** Три флакона для блока «Подбор аромата» */
export const quizImages = pick("lancome-la-vie-est-belle", "tom-ford-lost-cherry", "le-labo-santal-33");
