import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
 en: {
 // Nav
 'nav.home': 'Home',
 'nav.menu': 'Menu',
 'nav.about': 'About',
 'nav.reservations': 'Reservations',
 'nav.contact': 'Contact',
 // Home - Hero
 'hero.title': 'The Taste of Authentic Damascus',
 'hero.subtitle': 'Discover the taste of authentic Syrian food, prepared with passion and a rich history.',
 'hero.book': 'Book a Table',
 'hero.menu': 'View Menu',
 // Home - Info
 'info.address': 'Damanhour - Al-Muhafaza St - In front of Social Club',
 'info.hours': 'Open 24 Hours',
 'info.phone': '17871',
 // Home - Story
 'story.subtitle': 'Our Heritage',
 'story.title': 'A Tradition of Excellence',
 'story.text': 'From the bustling streets of ancient Syria to your plate, Al Demashqi is more than just a restaurant; it\'s a celebration of heritage. Our master chefs use only the finest ingredients to ensure every bite tells a story of tradition, flavor, and family.',
 'story.btn': 'Discover Our Story',
 // Home - Featured
 'featured.subtitle': 'Signature Dishes',
 'featured.title': 'Culinary Masterpieces',
 'featured.dish1.name': 'Demashqi Shawarma',
 'featured.dish1.desc': 'Marinated in secret spices and slow-roasted to perfection.',
 'featured.dish2.name': 'Family Submarine',
 'featured.dish2.desc': 'A massive feast loaded with tender chicken, fries, and our signature sauces.',
 'featured.dish3.name': 'Stuffed Crust Pizza',
 'featured.dish3.desc': 'Authentic toppings meeting golden, cheese-stuffed crusts.',
 'featured.btn': 'View Full Menu',
 // Footer
 'footer.desc': 'Authentic Syrian & Middle Eastern Cuisine',
 'footer.gallery': 'Gallery',
 'footer.locations': 'Locations',
 'footer.story': 'Our Story',
 'footer.chef': 'Chef',
 'footer.events': 'Events',
 'footer.testimonials': 'Testimonials',
 'footer.feedback': 'Feedback',
 'footer.rights': 'Al Demashqi Restaurant. All rights reserved.',

 // Contact Page
 'contact.title': 'Contact Us',
 'contact.subtitle': 'We\'d love to hear your opinions and feedback.',
 'contact.getInTouch': 'Get in Touch',
 'contact.getInTouchDesc': 'Have an opinion on our new dishes? Or a question about our menu, events, or catering? Send us a message and our team will be happy to assist you.',
 'contact.location': '📍 Location',
 'contact.locationDesc': `• Main Branch - Al-Muhafaza St. - In front of Social Club 
 • Branch Al-Rahibat branch - Middle of Al-Rahibat St 
 • Damanhour University Branch - Colleges Complex - University Tower`,
 'contact.phone': '📞 Phone',
 'contact.phoneDesc': `• Main Branch - 045/3149997 - 01094956760 
 • Al-Rahibat Branch - 045/3220067 - 01060646298 
 • Damanhour University Branch - 045/3149998 `,
 'contact.email': '✉️ Email',
 'contact.emailDesc': 'hello@aldemashqi.qa',
 'contact.form.name': 'Name',
 'contact.form.email': 'Email (Gmail preferred)',
 'contact.form.subject': 'Opinion / Subject',
 'contact.form.subjectPlaceholder': 'Tell us your opinion...',
 'contact.form.message': 'Message',
 'contact.form.sending': 'Sending...',
 'contact.form.send': 'Send Message',
 'contact.status.success': 'Message sent! We value your opinion and will get back to you.',
 'contact.status.fail': 'Failed to send message.',
 'contact.status.networkError': 'Network error. Please try again later.',

 // Track Order Page
 'track.title': 'Track Your Order',
 'track.subtitle': 'Enter your Order ID below to check live delivery updates',
 'track.placeholder': 'e.g. Order #42',
 'track.btn': 'Track',
 'track.checking': 'Checking status...',
 'track.notFound': 'Order not found. Please check the ID and try again.',
 'track.networkError': 'Could not connect to tracking server.',
 'track.orderNum': 'Order #',
 'track.placedOn': 'Placed on',
 'track.address': 'Delivery Address',
 'track.step.placed': 'Order Placed',
 'track.step.preparing': 'Preparing',
 'track.step.onway': 'On the Way',
 'track.step.delivered': 'Delivered',
 'track.payment.vodafone': 'Vodafone Cash',
 'track.payment.cash': 'Cash on Delivery',

 // Menu Page
 'menu.title': 'Our Menu',
 'menu.subtitle': 'Click any item to add it to your delivery order',
 'menu.filter.all': 'All',
 'menu.categories': {
 'shawarma': 'Shawarma & Sandwiches',
 'broasted': 'Broasted & Meals',
 'pizza': 'Pizza & Manakish',
 'crepes': 'Crepes & Maria',
 'appetizers': 'Appetizers & Trays',
 'drinks': 'Drinks & Desserts',
 },
 'menu.items': {
 // Shawarma & Sandwiches
 'sh_sand_chicken': { name: 'Chicken Shawarma Sandwich', desc: 'Toasted Syrian bread with garlic and pickles.', price: { 'Small': 40, 'Medium': 55, 'Large': 70 } },
 'sh_sand_meat': { name: 'Meat Shawarma Sandwich', desc: 'Toasted Syrian bread with tahini and onions.', price: { 'Small': 50, 'Medium': 65, 'Large': 80 } },
 'sh_box_chicken': { name: 'Chicken Shawarma Box', desc: 'Arabi cuts with fries and garlic dip.', price: { 'Single': 90, 'Double': 170, 'Triple': 250 } },
 'sh_box_meat': { name: 'Meat Shawarma Box', desc: 'Arabi cuts with fries and tahini.', price: { 'Single': 110, 'Double': 210, 'Triple': 300 } },
 'sh_box_mix': { name: 'Mix Shawarma Box', desc: 'Chicken and meat cuts with fries.', price: { 'Single': 100, 'Double': 190, 'Triple': 280 } },
 'sh_fatteh_chicken': { name: 'Chicken Shawarma Fatteh', desc: 'Toasted bread, rice, chicken, and yogurt sauce.', price: 90 },
 'sh_fatteh_meat': { name: 'Meat Shawarma Fatteh', desc: 'Toasted bread, rice, meat, and yogurt sauce.', price: 110 },
 'sh_fatteh_mix': { name: 'Mix Shawarma Fatteh', desc: 'Chicken and meat fatteh.', price: 110 },
 'west_shish': { name: 'Shish Tawook Sandwich', desc: 'Grilled chicken skewers in bread.', price: { 'Syrian': 60, 'French': 70 } },
 'west_crispy': { name: 'Crispy Chicken Sandwich', desc: 'Fried chicken strips with cheese.', price: { 'Syrian': 65, 'French': 75 } },
 'west_zinger': { name: 'Zinger Sandwich', desc: 'Spicy fried chicken with cheese.', price: { 'Syrian': 65, 'French': 75 } },
 'west_fajita': { name: 'Fajita Sandwich', desc: 'Chicken with peppers and onions.', price: { 'Syrian': 65, 'French': 75 } },
 'west_francisco': { name: 'Francisco Sandwich', desc: 'Chicken with mushrooms and corn.', price: { 'Syrian': 65, 'French': 75 } },
 'west_panne': { name: 'Panne Sandwich', desc: 'Fried breaded chicken.', price: { 'Syrian': 65, 'French': 75 } },
 'west_hotdog': { name: 'Hot Dog Sandwich', desc: 'Grilled hot dog with sauces.', price: { 'Syrian': 55, 'French': 65 } },
 'west_potato': { name: 'Potato & Cheese Sandwich', desc: 'Fries with melted cheese.', price: { 'Syrian': 35, 'French': 45 } },
 'west_liver': { name: 'Liver Sandwich', desc: 'Aleppo or Alexandrian style liver.', price: { 'Syrian': 45, 'French': 55 } },

 // Broasted & Meals
 'br_2': { name: 'Broasted (2 Pieces)', desc: 'Crispy fried chicken with fries and garlic dip.', price: 75 },
 'br_3': { name: 'Broasted (3 Pieces)', desc: 'Crispy fried chicken with fries and garlic dip.', price: 105 },
 'br_4': { name: 'Broasted (4 Pieces)', desc: 'Crispy fried chicken with fries and garlic dip.', price: 140 },
 'br_6': { name: 'Broasted (6 Pieces)', desc: 'Crispy fried chicken with fries and garlic dip.', price: 200 },
 'br_8': { name: 'Broasted (8 Pieces)', desc: 'Crispy fried chicken with fries and garlic dip.', price: 260 },
 'br_12': { name: 'Family Broasted (12 Pieces)', desc: 'Large bucket with fries and garlic dip.', price: 380 },
 'br_strips': { name: 'Chicken Strips Meal', desc: 'Crispy chicken tenders.', price: { '3 Pcs': 100, '5 Pcs': 140 } },
 'meal_shish': { name: 'Shish Tawook Meal', desc: 'Grilled chicken skewers meal.', price: 130 },
 'meal_crispy': { name: 'Crispy Meal', desc: 'Fried chicken strips meal.', price: 135 },
 'meal_zinger': { name: 'Zinger Meal', desc: 'Spicy fried chicken meal.', price: 135 },
 'meal_fajita': { name: 'Fajita Meal', desc: 'Chicken fajita plate.', price: 130 },
 'meal_panne': { name: 'Panne Meal', desc: 'Breaded chicken plate.', price: 135 },
 'meal_kebab': { name: 'Kebab Halabi Meal', desc: 'Aleppo style meat kebab.', price: 140 },

 // Pizza & Manakish
 'pz_margherita': { name: 'Margherita Pizza', desc: 'Classic cheese and tomato sauce.', price: { 'Medium': 70, 'Large': 95 } },
 'pz_veg': { name: 'Vegetables Pizza', desc: 'Mixed fresh vegetables and cheese.', price: { 'Medium': 75, 'Large': 105 } },
 'pz_mushroom': { name: 'Mushroom Pizza', desc: 'Fresh mushrooms and cheese.', price: { 'Medium': 85, 'Large': 115 } },
 'pz_salami': { name: 'Salami / Pepperoni Pizza', desc: 'Beef salami slices and cheese.', price: { 'Medium': 90, 'Large': 125 } },
 'pz_hotdog': { name: 'Hot Dog Pizza', desc: 'Sliced hot dog and cheese.', price: { 'Medium': 90, 'Large': 125 } },
 'pz_minced': { name: 'Minced Meat Pizza', desc: 'Seasoned minced meat.', price: { 'Medium': 90, 'Large': 125 } },
 'pz_mixmeat': { name: 'Mix Meat Pizza', desc: 'Assorted premium meats.', price: { 'Medium': 105, 'Large': 140 } },
 'pz_bbq': { name: 'Chicken BBQ Pizza', desc: 'Grilled chicken with BBQ sauce.', price: { 'Medium': 100, 'Large': 135 } },
 'pz_ranch': { name: 'Chicken Ranch Pizza', desc: 'Chicken with ranch dressing.', price: { 'Medium': 105, 'Large': 140 } },
 'pz_shish': { name: 'Shish Tawook Pizza', desc: 'Grilled shish tawook chicken.', price: { 'Medium': 100, 'Large': 135 } },
 'pz_mixcheese': { name: 'Mix Cheese Pizza', desc: 'Blend of premium cheeses.', price: { 'Medium': 90, 'Large': 125 } },
 'pz_super': { name: 'Super Supreme Pizza', desc: 'The ultimate loaded pizza.', price: { 'Medium': 110, 'Large': 145 } },
 'pz_seafood': { name: 'Seafood Pizza', desc: 'Mixed seafood toppings.', price: { 'Medium': 120, 'Large': 155 } },
 'pz_tuna': { name: 'Tuna Pizza', desc: 'Tuna and onions.', price: { 'Medium': 95, 'Large': 130 } },
 'pz_stuffed': { name: 'Stuffed Crust Addition', desc: 'Add cheese stuffed crust to any pizza.', price: 25 },

 'man_zaatar': { name: 'Zaatar Manakish', desc: 'Thyme and sesame with olive oil.', price: 25 },
 'man_zaatar_cheese': { name: 'Zaatar & Cheese Manakish', desc: 'Thyme with melted cheese.', price: 35 },
 'man_muhammara': { name: 'Muhammara Manakish', desc: 'Spicy red pepper paste.', price: 25 },
 'man_muhammara_cheese': { name: 'Muhammara & Cheese Manakish', desc: 'Spicy pepper paste with cheese.', price: 35 },
 'man_cheese': { name: 'Akkawi Cheese Manakish', desc: 'Melted Akkawi cheese.', price: 45 },
 'man_mixcheese': { name: 'Mix Cheese Manakish', desc: 'Blend of cheeses.', price: 50 },
 'man_spinach': { name: 'Spinach Manakish', desc: 'Fresh spinach and lemon.', price: 25 },
 'man_spinach_cheese': { name: 'Spinach & Cheese Manakish', desc: 'Spinach with melted cheese.', price: 35 },
 'man_meat': { name: 'Meat & Dough Manakish', desc: 'Minced meat on dough.', price: 40 },
 'man_meat_cheese': { name: 'Meat & Cheese Manakish', desc: 'Minced meat with melted cheese.', price: 50 },
 'man_salami_cheese': { name: 'Salami & Cheese Manakish', desc: 'Salami slices with cheese.', price: 45 },
 'man_hotdog_cheese': { name: 'Hot Dog & Cheese Manakish', desc: 'Hot dog slices with cheese.', price: 45 },

 // Crepes, Maria, Shamarikh
 'cr_shish': { name: 'Shish Tawook Crepe', desc: 'Chicken shish with cheese in a crispy crepe.', price: 75 },
 'cr_fajita': { name: 'Fajita Crepe', desc: 'Chicken fajita with cheese.', price: 75 },
 'cr_crispy': { name: 'Crispy Crepe', desc: 'Fried chicken strips crepe.', price: 75 },
 'cr_zinger': { name: 'Zinger Crepe', desc: 'Spicy fried chicken crepe.', price: 75 },
 'cr_panne': { name: 'Panne Crepe', desc: 'Breaded chicken crepe.', price: 75 },
 'cr_cordon': { name: 'Cordon Bleu Crepe', desc: 'Chicken stuffed with cheese and turkey.', price: 85 },
 'cr_mixcheese': { name: 'Mix Cheese Crepe', desc: 'Blend of premium cheeses.', price: 70 },
 'cr_hotdog': { name: 'Hot Dog Crepe', desc: 'Sliced hot dog crepe.', price: 70 },
 'cr_mixchicken': { name: 'Mix Chicken Crepe', desc: 'Assorted chicken crepe.', price: 85 },
 'cr_mixmeat': { name: 'Mix Meat Crepe', desc: 'Assorted meat crepe.', price: 95 },
 'cr_burger': { name: 'Burger Crepe', desc: 'Beef burger patty crepe.', price: 75 },
 'cr_nutella': { name: 'Nutella Crepe', desc: 'Sweet crepe with Nutella.', price: 50 },

 'maria_chicken': { name: 'Maria Chicken', desc: 'Toasted flatbread stuffed with chicken and cheese.', price: { 'Medium': 60, 'Large': 95 } },
 'maria_meat': { name: 'Maria Meat', desc: 'Toasted flatbread stuffed with meat and cheese.', price: { 'Medium': 70, 'Large': 110 } },
 'maria_mix': { name: 'Maria Mix', desc: 'Mix of chicken and meat.', price: 110 },

 'sham_chicken': { name: 'Shamarikh Chicken', desc: 'Rolled and baked chicken delicacy.', price: 90 },
 'sham_meat': { name: 'Shamarikh Meat', desc: 'Rolled and baked meat delicacy.', price: 110 },
 'sham_mix': { name: 'Shamarikh Mix', desc: 'Mix of chicken and meat.', price: 110 },

 // Appetizers & Trays
 'tray_3': { name: 'Family Tray (3 Persons)', desc: 'Mix grills and rice.', price: 320 },
 'tray_4': { name: 'Family Tray (4 Persons)', desc: 'Mix grills and rice.', price: 420 },
 'tray_5': { name: 'Family Tray (5 Persons)', desc: 'Mix grills and rice.', price: 520 },
 'tray_6': { name: 'Family Tray (6 Persons)', desc: 'Mix grills and rice.', price: 620 },

 'app_hummus': { name: 'Hummus', desc: 'Creamy pureed chickpeas.', price: { 'Small': 25, 'Medium': 40, 'Large': 55 } },
 'app_mutabal': { name: 'Mutabal', desc: 'Roasted eggplant dip.', price: { 'Small': 25, 'Medium': 40, 'Large': 55 } },
 'app_babaghanoush': { name: 'Baba Ghanoush', desc: 'Smoky eggplant with vegetables.', price: { 'Small': 25, 'Medium': 40, 'Large': 55 } },
 'app_garlic': { name: 'Garlic Dip / Spicy', desc: 'Classic or spicy garlic sauce.', price: { 'Small': 15, 'Medium': 25, 'Large': 40 } },
 'app_coleslaw': { name: 'Coleslaw', desc: 'Fresh cabbage and carrot salad.', price: { 'Small': 20, 'Medium': 35, 'Large': 50 } },
 'app_salad': { name: 'Green Salad / Fattoush / Tabbouleh', desc: 'Fresh traditional salads.', price: { 'Small': 25, 'Medium': 40, 'Large': 55 } },
 'app_pickles': { name: 'Pickles', desc: 'Assorted Syrian pickles.', price: { 'Small': 10, 'Medium': 20, 'Large': 30 } },
 'app_fries': { name: 'French Fries', desc: 'Crispy golden fries.', price: { 'Small': 20, 'Medium': 30, 'Large': 40 } },
 'app_fries_cheese': { name: 'Fries with Cheese', desc: 'Fries loaded with melted cheese.', price: { 'Small': 40, 'Medium': 50, 'Large': 60 } },
 'app_vineleaves': { name: 'Vine Leaves', desc: 'Stuffed grape leaves.', price: { '6 Pcs': 30, '12 Pcs': 50 } },
 'app_kibbeh': { name: 'Fried Kibbeh', desc: 'Stuffed bulgur shell.', price: 15 },
 'app_samosa': { name: 'Cheese / Meat Samosa', desc: 'Crispy pastry.', price: 12 },
 'app_fatteh': { name: 'Fatteh', desc: 'Crispy bread, yogurt, and chickpeas.', price: { 'Medium': 40, 'Large': 55 } },

 // Drinks & Desserts
 'dr_espresso': { name: 'Espresso', desc: 'Strong Italian coffee.', price: { 'Single': 25, 'Double': 35 } },
 'dr_macchiato': { name: 'Macchiato', desc: 'Espresso with a dash of milk.', price: { 'Single': 30, 'Double': 40 } },
 'dr_cortado': { name: 'Cortado', desc: 'Equal parts espresso and warm milk.', price: 45 },
 'dr_flatwhite': { name: 'Flat White', desc: 'Espresso with microfoam.', price: 50 },
 'dr_cappuccino': { name: 'Cappuccino', desc: 'Espresso with steamed milk foam.', price: 45 },
 'dr_latte': { name: 'Latte', desc: 'Hot or iced latte.', price: 40 },
 'dr_americano': { name: 'Americano', desc: 'Espresso with hot water.', price: 40 },
 'dr_cocktail': { name: 'Fresh Cocktail', desc: 'Mixed seasonal fruits.', price: 50 },
 'dr_mango': { name: 'Mango Juice', desc: 'Fresh mango.', price: 40 },
 'dr_strawberry': { name: 'Strawberry Juice', desc: 'Fresh strawberry.', price: 40 },
 'dr_orange': { name: 'Orange Juice', desc: 'Fresh squeezed orange.', price: 35 },
 'dr_lemonmint': { name: 'Lemon Mint', desc: 'Refreshing lemon and mint.', price: 35 },
 'dr_nescafe': { name: 'Nescafe', desc: 'Instant coffee.', price: { 'Black': 25, 'Milk': 35 } },
 'dr_turkish': { name: 'Turkish Coffee', desc: 'Traditional unfiltered coffee.', price: { 'Single': 25, 'Double': 35 } },
 'dr_french': { name: 'French Coffee', desc: 'Coffee with milk.', price: 40 },
 'dr_hazelnut': { name: 'Hazelnut Coffee', desc: 'Flavored coffee.', price: 45 },
 'dr_tea': { name: 'Tea / Flavored Tea', desc: 'Hot brewed tea.', price: { 'Regular': 15, 'Flavored': 20 } },
 'dr_cider': { name: 'Hot Cider', desc: 'Warm spiced apple drink.', price: 30 },
 'dr_hotchocolate': { name: 'Hot Chocolate', desc: 'Rich cocoa drink.', price: 45 },
 'dr_sahlab': { name: 'Sahlab', desc: 'Warm creamy winter drink.', price: 40 },

 'ds_waffle': { name: 'Waffle (Nutella / Lotus)', desc: 'Fresh waffle with toppings.', price: { 'Nutella': 55, 'Lotus': 65 } },
 'ds_waffle_mix': { name: 'Waffle Mix', desc: 'Mixed toppings waffle.', price: 70 },
 'ds_waffle_fruits': { name: 'Waffle Fruits', desc: 'Waffle with fresh fruits.', price: 75 },
 'ds_cheesecake': { name: 'Cheesecake', desc: 'Strawberry, Blueberry, Lotus, or Nutella.', price: 65 },
 'ds_brownies': { name: 'Brownies', desc: 'Rich chocolate brownie.', price: 55 },
 'ds_molten': { name: 'Molten Cake', desc: 'Warm cake with a gooey chocolate center.', price: 70 },
 'ds_sanseb': { name: 'San Sebastian', desc: 'Burnt basque cheesecake.', price: 90 },
 'ds_cookies': { name: 'Cookies', desc: 'Fresh baked cookies.', price: 40 },
 }
 },
 ar: {
 // Nav
 'nav.home': 'الرئيسية',
 'nav.menu': 'المنيو',
 'nav.about': 'من نحن',
 'nav.reservations': 'الحجوزات',
 'nav.contact': 'اتصل بنا',
 // Home - Hero
 'hero.title': 'ملوك الشاورما في مصر',
 'hero.subtitle': 'اكتشف طعم الأكل السوري الأصيل، محضّر بشغف وتاريخ عريق.',
 'hero.book': 'احجز طاولتك',
 'hero.menu': 'تصفح المنيو',
 // Home - Info
 'info.address': 'شارع المحافظة امام النادي الاجتماعي',
 'info.hours': 'مفتوح ٢٤ ساعة',
 'info.phone': '١٧٨٧١',
 // Home - Story
 'story.subtitle': 'تراثنا',
 'story.title': 'عراقة المذاق الدمشقي',
 'story.text': 'من شوارع دمشق العريقة إلى مائدتك، الدمشقي ليس مجرد مطعم؛ بل هو احتفال بالتراث. طهاتنا الماهرون يستخدمون أفضل المكونات لضمان أن كل لقمة تحكي قصة العائلة والنكهة السورية الأصيلة.',
 'story.btn': 'اكتشف قصتنا',
 // Home - Featured
 'featured.subtitle': 'أطباق مميزة',
 'featured.title': 'روائع المطبخ الدمشقي',
 'featured.dish1.name': 'شاورما الدمشقي',
 'featured.dish1.desc': 'متبلة بخلطتنا السرية ومشوية على نار هادئة.',
 'featured.dish2.name': 'الصاروخ العائلي',
 'featured.dish2.desc': 'وجبة عملاقة مليئة بالدجاج والبطاطس والصوصات المميزة.',
 'featured.dish3.name': 'بيتزا الدمشقي المحشية',
 'featured.dish3.desc': 'أطراف محشية بالجبن مع أشهى الإضافات الأصلية.',
 'featured.btn': 'عرض المنيو كامل',
 // Footer
 'footer.desc': 'المأكولات السورية الأصلية',
 'footer.gallery': 'معرض الصور',
 'footer.locations': 'فروعنا',
 'footer.story': 'قصتنا',
 'footer.chef': 'الطهاة',
 'footer.events': 'الفعاليات',
 'footer.testimonials': 'آراء العملاء',
 'footer.feedback': 'المقترحات والشكاوى',
 'footer.rights': 'مطعم الدمشقي. جميع الحقوق محفوظة.',

 // Contact Page
 'contact.title': 'اتصل بنا',
 'contact.subtitle': 'نود أن نسمع آراءك وملاحظاتك.',
 'contact.getInTouch': 'تواصل معنا',
 'contact.getInTouchDesc': 'هل لديك رأي حول أطباقنا الجديدة؟ أو سؤال حول قائمتنا، فعالياتنا، أو خدمات تقديم الطعام؟ أرسل لنا رسالة وسيسعد فريقنا بمساعدتك.',
 'contact.location': '📍 الموقع',
 'contact.locationDesc': '• الفرع الرئيسي شارع المحافظة - امام النادي الاجتماعي\n• فرع الراهبات - وسط شارع الراهبات\n• فرع جامعة دمنهور - مجمع الكليات - برج الجامعة',
 'contact.phone': '📞 الهاتف',
 'contact.phoneDesc': ' الفرع الرئيسي - 045/3149997 - 01094956760 •\nفرع الراهبات - 045/3220067 - 01060646298 •\n الفرع جامعة دمنهور - 045/3149998 •',
 'contact.email': '✉️ البريد الإلكتروني',
 'contact.emailDesc': 'hello@aldemashqi.qa',
 'contact.form.name': 'الاسم',
 'contact.form.email': 'البريد الإلكتروني (يفضل جيميل)',
 'contact.form.subject': 'الرأي / الموضوع',
 'contact.form.subjectPlaceholder': 'أخبرنا برأيك...',
 'contact.form.message': 'الرسالة',
 'contact.form.sending': 'جاري الإرسال...',
 'contact.form.send': 'إرسال الرسالة',
 'contact.status.success': 'تم إرسال الرسالة! نحن نقدر رأيك وسنعاود الاتصال بك.',
 'contact.status.fail': 'فشل إرسال الرسالة.',
 'contact.status.networkError': 'خطأ في الشبكة. يرجى المحاولة مرة أخرى لاحقاً.',

 // Track Order Page
 'track.title': 'تتبع طلبك',
 'track.subtitle': 'أدخل رقم الطلب أدناه لمتابعة التوصيل مباشرة',
 'track.placeholder': 'مثال: رقم الطلب ٤٢',
 'track.btn': 'تتبع',
 'track.checking': 'جاري التحقق من الحالة...',
 'track.notFound': 'لم يتم العثور على الطلب. تحقق من الرقم وحاول مجدداً.',
 'track.networkError': 'تعذر الاتصال بخادم التتبع.',
 'track.orderNum': 'طلب رقم #',
 'track.placedOn': 'تم الطلب في',
 'track.address': 'عنوان التوصيل',
 'track.step.placed': 'تم تقديم الطلب',
 'track.step.preparing': 'جاري التحضير',
 'track.step.onway': 'في الطريق إليك',
 'track.step.delivered': 'تم التوصيل',
 'track.payment.vodafone': 'فودافون كاش',
 'track.payment.cash': 'الدفع عند الاستلام',

 // Menu Page
 'menu.title': 'قائمة الطعام',
 'menu.subtitle': 'اضغط على أي صنف لإضافته إلى طلبك',
 'menu.filter.all': 'الكل',
 'menu.categories': {
 'shawarma': 'شاورما وسندويشات',
 'broasted': 'بروستد ووجبات',
 'pizza': 'بيتزا ومناقيش',
 'crepes': 'كريب وماريا',
 'appetizers': 'مقبلات وصواني',
 'drinks': 'مشروبات وحلويات',
 },
 'menu.items': {
 // Shawarma & Sandwiches
 'sh_sand_chicken': { name: 'سندويش شاورما دجاج', desc: 'خبز سوري محمص مع الثومية والمخلل.', price: { 'صغير': 40, 'وسط': 55, 'كبير': 70 } },
 'sh_sand_meat': { name: 'سندويش شاورما لحم', desc: 'خبز سوري محمص مع الطحينة والبصل.', price: { 'صغير': 50, 'وسط': 65, 'كبير': 80 } },
 'sh_box_chicken': { name: 'شاورما عربي دجاج', desc: 'قطع عربي مع بطاطس وثومية.', price: { 'سنجل': 90, 'دبل': 170, 'تريبل': 250 } },
 'sh_box_meat': { name: 'شاورما عربي لحم', desc: 'قطع عربي مع بطاطس وطحينة.', price: { 'سنجل': 110, 'دبل': 210, 'تريبل': 300 } },
 'sh_box_mix': { name: 'شاورما عربي ميكس', desc: 'دجاج ولحم مع بطاطس.', price: { 'سنجل': 100, 'دبل': 190, 'تريبل': 280 } },
 'sh_fatteh_chicken': { name: 'فتة شاورما دجاج', desc: 'خبز محمص، أرز، شاورما دجاج، وصوص.', price: 90 },
 'sh_fatteh_meat': { name: 'فتة شاورما لحم', desc: 'خبز محمص، أرز، شاورما لحم، وصوص.', price: 110 },
 'sh_fatteh_mix': { name: 'فتة شاورما ميكس', desc: 'مزيج من الدجاج واللحم.', price: 110 },
 'west_shish': { name: 'سندويش شيش طاووق', desc: 'أسياخ دجاج مشوي.', price: { 'سوري': 60, 'فرنساوي': 70 } },
 'west_crispy': { name: 'سندويش كريسبي', desc: 'قطع دجاج مقرمشة مع الجبن.', price: { 'سوري': 65, 'فرنساوي': 75 } },
 'west_zinger': { name: 'سندويش زنجر', desc: 'دجاج مقلي حار مع الجبن.', price: { 'سوري': 65, 'فرنساوي': 75 } },
 'west_fajita': { name: 'سندويش فاهيتا', desc: 'دجاج مع فلفل وبصل.', price: { 'سوري': 65, 'فرنساوي': 75 } },
 'west_francisco': { name: 'سندويش فرانسيسكو', desc: 'دجاج مع فطر وذرة.', price: { 'سوري': 65, 'فرنساوي': 75 } },
 'west_panne': { name: 'سندويش بانيه', desc: 'دجاج بانيه مقلي.', price: { 'سوري': 65, 'فرنساوي': 75 } },
 'west_hotdog': { name: 'سندويش هوت دوج', desc: 'هوت دوج مشوي مع صوصات.', price: { 'سوري': 55, 'فرنساوي': 65 } },
 'west_potato': { name: 'سندويش بطاطس بالجبنة', desc: 'بطاطس مقلية مع جبن ذائب.', price: { 'سوري': 35, 'فرنساوي': 45 } },
 'west_liver': { name: 'سندويش كبدة', desc: 'كبدة حلبية أو اسكندراني.', price: { 'سوري': 45, 'فرنساوي': 55 } },

 // Broasted & Meals
 'br_2': { name: 'بروستد (٢ قطعة)', desc: 'دجاج مقلي مقرمش مع بطاطس وثومية.', price: 75 },
 'br_3': { name: 'بروستد (٣ قطع)', desc: 'دجاج مقلي مقرمش مع بطاطس وثومية.', price: 105 },
 'br_4': { name: 'بروستد (٤ قطع)', desc: 'دجاج مقلي مقرمش مع بطاطس وثومية.', price: 140 },
 'br_6': { name: 'بروستد (٦ قطع)', desc: 'دجاج مقلي مقرمش مع بطاطس وثومية.', price: 200 },
 'br_8': { name: 'بروستد (٨ قطع)', desc: 'دجاج مقلي مقرمش مع بطاطس وثومية.', price: 260 },
 'br_12': { name: 'بروستد عائلي (١٢ قطعة)', desc: 'وجبة عائلية مع بطاطس وثومية.', price: 380 },
 'br_strips': { name: 'وجبة استربس', desc: 'قطع دجاج مقرمشة (٣ أو ٥ قطع).', price: { '٣ قطع': 100, '٥ قطع': 140 } },
 'meal_shish': { name: 'وجبة شيش طاووق', desc: 'أسياخ دجاج مشوي مع الأطباق الجانبية.', price: 130 },
 'meal_crispy': { name: 'وجبة كريسبي', desc: 'قطع دجاج مقرمشة مع الأطباق الجانبية.', price: 135 },
 'meal_zinger': { name: 'وجبة زنجر', desc: 'دجاج حار مقرمش مع الأطباق الجانبية.', price: 135 },
 'meal_fajita': { name: 'وجبة فاهيتا', desc: 'فاهيتا دجاج مع الأطباق الجانبية.', price: 130 },
 'meal_panne': { name: 'وجبة بانيه', desc: 'دجاج بانيه مع الأطباق الجانبية.', price: 135 },
 'meal_kebab': { name: 'وجبة كباب حلبي', desc: 'كباب لحم على الطريقة الحلبية.', price: 140 },

 // Pizza & Manakish
 'pz_margherita': { name: 'بيتزا مارغريتا', desc: 'صلصة الطماطم الكلاسيكية مع الجبن.', price: { 'وسط': 70, 'كبير': 95 } },
 'pz_veg': { name: 'بيتزا خضار', desc: 'تشكيلة من الخضار الطازج والجبن.', price: { 'وسط': 75, 'كبير': 105 } },
 'pz_mushroom': { name: 'بيتزا عش الغراب (مشروم)', desc: 'فطر طازج مع الجبن.', price: { 'وسط': 85, 'كبير': 115 } },
 'pz_salami': { name: 'بيتزا سلامي / بيبيروني', desc: 'شرائح السلامي مع الجبن.', price: { 'وسط': 90, 'كبير': 125 } },
 'pz_hotdog': { name: 'بيتزا هوت دوج', desc: 'شرائح هوت دوج مع الجبن.', price: { 'وسط': 90, 'كبير': 125 } },
 'pz_minced': { name: 'بيتزا لحم مفروم', desc: 'لحم مفروم متبل.', price: { 'وسط': 90, 'كبير': 125 } },
 'pz_mixmeat': { name: 'بيتزا ميكس لحوم', desc: 'تشكيلة لحوم مميزة.', price: { 'وسط': 105, 'كبير': 140 } },
 'pz_bbq': { name: 'بيتزا تشيكن باربكيو', desc: 'دجاج مشوي مع صوص الباربيكيو.', price: { 'وسط': 100, 'كبير': 135 } },
 'pz_ranch': { name: 'بيتزا تشيكن رانش', desc: 'دجاج مع صوص الرانش.', price: { 'وسط': 105, 'كبير': 140 } },
 'pz_shish': { name: 'بيتزا شيش طاووق', desc: 'قطع شيش طاووق مشوية.', price: { 'وسط': 100, 'كبير': 135 } },
 'pz_mixcheese': { name: 'بيتزا ميكس جبن', desc: 'تشكيلة أجبان فاخرة.', price: { 'وسط': 90, 'كبير': 125 } },
 'pz_super': { name: 'بيتزا سوبر سوبريم', desc: 'بيتزا غنية بكل الإضافات.', price: { 'وسط': 110, 'كبير': 145 } },
 'pz_seafood': { name: 'بيتزا سي فود', desc: 'فواكه البحر المشكلة.', price: { 'وسط': 120, 'كبير': 155 } },
 'pz_tuna': { name: 'بيتزا تونة', desc: 'تونة مع البصل والزيتون.', price: { 'وسط': 95, 'كبير': 130 } },
 'pz_stuffed': { name: 'إضافة أطراف محشية', desc: 'أضف أطراف محشية بالجبن لأي بيتزا.', price: 25 },

 'man_zaatar': { name: 'منقوشة زعتر', desc: 'زعتر مع زيت الزيتون.', price: 25 },
 'man_zaatar_cheese': { name: 'منقوشة زعتر وجبنة', desc: 'زعتر مع جبن ذائب.', price: 35 },
 'man_muhammara': { name: 'منقوشة محمرة', desc: 'معجون الفليفلة الحارة.', price: 25 },
 'man_muhammara_cheese': { name: 'منقوشة محمرة وجبنة', desc: 'محمرة مع جبن ذائب.', price: 35 },
 'man_cheese': { name: 'منقوشة جبنة عكاوي', desc: 'جبنة عكاوي ذائبة.', price: 45 },
 'man_mixcheese': { name: 'منقوشة ميكس جبن', desc: 'تشكيلة أجبان.', price: 50 },
 'man_spinach': { name: 'منقوشة سبانخ', desc: 'سبانخ طازجة بالليمون.', price: 25 },
 'man_spinach_cheese': { name: 'منقوشة سبانخ وجبنة', desc: 'سبانخ مع جبن ذائب.', price: 35 },
 'man_meat': { name: 'منقوشة لحم بعجين', desc: 'لحم مفروم على العجين.', price: 40 },
 'man_meat_cheese': { name: 'منقوشة لحم وجبنة', desc: 'لحم مفروم مع جبن.', price: 50 },
 'man_salami_cheese': { name: 'منقوشة سلامي وجبنة', desc: 'شرائح سلامي مع جبن.', price: 45 },
 'man_hotdog_cheese': { name: 'منقوشة هوت دوج وجبنة', desc: 'شرائح هوت دوج مع جبن.', price: 45 },

 // Crepes, Maria, Shamarikh
 'cr_shish': { name: 'كريب شيش طاووق', desc: 'شيش طاووق مع جبن في كريب مقرمش.', price: 75 },
 'cr_fajita': { name: 'كريب فاهيتا', desc: 'فاهيتا دجاج مع جبن.', price: 75 },
 'cr_crispy': { name: 'كريب كريسبي', desc: 'استربس دجاج مقرمش.', price: 75 },
 'cr_zinger': { name: 'كريب زنجر', desc: 'دجاج زنجر حار.', price: 75 },
 'cr_panne': { name: 'كريب بانيه', desc: 'دجاج بانيه.', price: 75 },
 'cr_cordon': { name: 'كريب كوردون بلو', desc: 'دجاج محشو بالجبن والحبش.', price: 85 },
 'cr_mixcheese': { name: 'كريب ميكس جبن', desc: 'تشكيلة أجبان.', price: 70 },
 'cr_hotdog': { name: 'كريب هوت دوج', desc: 'شرائح هوت دوج.', price: 70 },
 'cr_mixchicken': { name: 'كريب ميكس دجاج', desc: 'تشكيلة دجاج.', price: 85 },
 'cr_mixmeat': { name: 'كريب ميكس لحوم', desc: 'تشكيلة لحوم.', price: 95 },
 'cr_burger': { name: 'كريب برجر', desc: 'برجر لحم.', price: 75 },
 'cr_nutella': { name: 'كريب نوتيلا', desc: 'كريب حلو بالنوتيلا.', price: 50 },

 'maria_chicken': { name: 'ماريا دجاج', desc: 'خبز محمص محشو بالدجاج والجبن.', price: { 'وسط': 60, 'كبير': 95 } },
 'maria_meat': { name: 'ماريا لحم', desc: 'خبز محمص محشو باللحم والجبن.', price: { 'وسط': 70, 'كبير': 110 } },
 'maria_mix': { name: 'ماريا ميكس', desc: 'ميكس دجاج ولحم.', price: 110 },

 'sham_chicken': { name: 'شماريخ دجاج', desc: 'رول دجاج بالفرن.', price: 90 },
 'sham_meat': { name: 'شماريخ لحم', desc: 'رول لحم بالفرن.', price: 110 },
 'sham_mix': { name: 'شماريخ ميكس', desc: 'ميكس دجاج ولحم.', price: 110 },

 // Appetizers & Trays
 'tray_3': { name: 'صينية عائلية (٣ أفراد)', desc: 'مشاوي مشكلة وأرز.', price: 320 },
 'tray_4': { name: 'صينية عائلية (٤ أفراد)', desc: 'مشاوي مشكلة وأرز.', price: 420 },
 'tray_5': { name: 'صينية عائلية (٥ أفراد)', desc: 'مشاوي مشكلة وأرز.', price: 520 },
 'tray_6': { name: 'صينية عائلية (٦ أفراد)', desc: 'مشاوي مشكلة وأرز.', price: 620 },

 'app_hummus': { name: 'حمص', desc: 'حمص مطحون ناعم.', price: { 'صغير': 25, 'وسط': 40, 'كبير': 55 } },
 'app_mutabal': { name: 'متبل', desc: 'باذنجان مشوي مهروس.', price: { 'صغير': 25, 'وسط': 40, 'كبير': 55 } },
 'app_babaghanoush': { name: 'بابا غنوج', desc: 'باذنجان مشوي مع الخضار.', price: { 'صغير': 25, 'وسط': 40, 'كبير': 55 } },
 'app_garlic': { name: 'ثومية / سبايسي', desc: 'ثومية كلاسيك أو حارة.', price: { 'صغير': 15, 'وسط': 25, 'كبير': 40 } },
 'app_coleslaw': { name: 'كول سلو', desc: 'سلطة ملفوف وجزر.', price: { 'صغير': 20, 'وسط': 35, 'كبير': 50 } },
 'app_salad': { name: 'سلطة خضراء / فتوش / تبولة', desc: 'سلطات تقليدية طازجة.', price: { 'صغير': 25, 'وسط': 40, 'كبير': 55 } },
 'app_pickles': { name: 'مخلل', desc: 'مخللات سورية مشكلة.', price: { 'صغير': 10, 'وسط': 20, 'كبير': 30 } },
 'app_fries': { name: 'بطاطس مقلية', desc: 'بطاطس ذهبية مقرمشة.', price: { 'صغير': 20, 'وسط': 30, 'كبير': 40 } },
 'app_fries_cheese': { name: 'بطاطس بالجبنة', desc: 'بطاطس مع جبن ذائب.', price: { 'صغير': 40, 'وسط': 50, 'كبير': 60 } },
 'app_vineleaves': { name: 'ورق عنب', desc: 'ورق عنب محشو.', price: { '٦ قطع': 30, '١٢ قطعة': 50 } },
 'app_kibbeh': { name: 'كبة مقلية', desc: 'حبة كبة مقرمشة.', price: 15 },
 'app_samosa': { name: 'سمبوسك جبنة / لحم', desc: 'حبة سمبوسك مقرمشة.', price: 12 },

 // Drinks & Desserts
 'dr_espresso': { name: 'اسبريسو', desc: 'قهوة إيطالية مركزة.', price: { 'سنجل': 25, 'دبل': 35 } },
 'dr_macchiato': { name: 'ميكياتو', desc: 'اسبريسو مع قليل من الحليب.', price: { 'سنجل': 30, 'دبل': 40 } },
 'dr_cortado': { name: 'كورتادو', desc: 'اسبريسو مع حليب دافئ.', price: 45 },
 'dr_flatwhite': { name: 'فلات وايت', desc: 'اسبريسو مع رغوة خفيفة.', price: 50 },
 'dr_cappuccino': { name: 'كابتشينو', desc: 'اسبريسو مع رغوة حليب.', price: 45 },
 'dr_latte': { name: 'لاتيه', desc: 'اسبريسو مع حليب مبخر.', price: 45 },
 'dr_americano': { name: 'أمريكانو', desc: 'اسبريسو مع ماء ساخن.', price: 40 },
 'dr_nescafe': { name: 'نسكافيه', desc: 'قهوة سريعة التحضير.', price: { 'بلاك': 25, 'حليب': 35 } },
 'dr_turkish': { name: 'قهوة تركي', desc: 'قهوة تركية أصلية.', price: { 'سنجل': 25, 'دبل': 35 } },
 'dr_french': { name: 'قهوة فرنساوي', desc: 'قهوة بالحليب.', price: 40 },
 'dr_hazelnut': { name: 'قهوة بندق', desc: 'قهوة بنكهة البندق.', price: 45 },
 'dr_tea': { name: 'شاي / شاي نكهات', desc: 'شاي ساخن.', price: { 'عادي': 15, 'نكهات': 20 } },
 'dr_cider': { name: 'هوت سايدر', desc: 'مشروب تفاح ساخن.', price: 30 },
 'dr_hotchocolate': { name: 'هوت شوكليت', desc: 'مشروب كاكاو غني.', price: 45 },
 'dr_sahlab': { name: 'سحلب', desc: 'مشروب شتوي دافئ.', price: 40 },

 'ds_waffle': { name: 'وافل (نوتيلا / لوتس)', desc: 'وافل طازج.', price: { 'نوتيلا': 55, 'لوتس': 65 } },
 'ds_waffle_mix': { name: 'وافل ميكس', desc: 'وافل بإضافات مشكلة.', price: 70 },
 'ds_waffle_fruits': { name: 'وافل فواكه', desc: 'وافل مع فواكه طازجة.', price: 75 },
 'ds_cheesecake': { name: 'تشيز كيك', desc: 'فراولة، توت، لوتس، نوتيلا.', price: 65 },
 'ds_brownies': { name: 'براونيز', desc: 'كيك شوكولاتة غني.', price: 55 },
 'ds_molten': { name: 'مولتن كيك', desc: 'كيك محشو بالشوكولاتة الذائبة.', price: 70 },
 'ds_sanseb': { name: 'سان سباستيان', desc: 'تشيز كيك محروقة.', price: 90 },
 'ds_cookies': { name: 'كوكيز', desc: 'كوكيز طازج مخبوز.', price: 40 },
 }
 }
};

export const LanguageProvider = ({ children }) => {
 const [language, setLanguage] = useState('ar');

 useEffect(() => {
 document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
 document.documentElement.lang = language;
 }, [language]);

 const toggleLanguage = () => {
 setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
 };

 const t = (key) => {
 // Try exact flat match first
 if (translations[language][key]) {
 return translations[language][key];
 }
 // Try nested match
 const keys = key.split('.');
 let value = translations[language];
 for (const k of keys) {
 if (value === undefined) break;
 value = value[k];
 }
 return value || key;
 };

 return (
 <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
 {children}
 </LanguageContext.Provider>
 );
};

export const useLanguage = () => useContext(LanguageContext);
