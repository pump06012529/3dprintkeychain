import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import helvetikerRegular from 'three/examples/fonts/helvetiker_regular.typeface.json';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';
import type { RegionSet, Ring, RGB } from '../types';

const fontLoader = new FontLoader();
const ttfLoader = new TTFLoader();

export interface FontOption {
  id: string;
  name: string;
  font: Font;
  imported?: boolean;
  subsets?: string[];
}

export const FONT_OPTIONS: FontOption[] = [];

const BUILT_IN_FONTS: [string, string, any][] = [
  ['helvetiker-regular', 'Standard', helvetikerRegular],
  ['helvetiker-bold', 'Standard Bold', helvetikerBold],
];

for (const [id, name, data] of BUILT_IN_FONTS) {
  FONT_OPTIONS.push({ id, name, font: fontLoader.parse(data) });
}

const BUNDLED_TTF: [string, string, string[]][] = [
  ['abeezee', 'ABeeZee', ["latin","latin-ext"]],
  ['abel', 'Abel', ["latin"]],
  ['aboreto', 'Aboreto', ["latin","latin-ext"]],
  ['abril-fatface', 'Abril Fatface', ["latin","latin-ext"]],
  ['aclonica', 'Aclonica', ["latin","latin-ext"]],
  ['acme', 'Acme', ["latin"]],
  ['adamina', 'Adamina', ["latin"]],
  ['advent-pro', 'Advent Pro', ["cyrillic","cyrillic-ext","greek","latin","latin-ext"]],
  ['albert-sans', 'Albert Sans', ["latin","latin-ext"]],
  ['aldrich', 'Aldrich', ["latin"]],
  ['alegreya', 'Alegreya', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['alegreya-sans', 'Alegreya Sans', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['alegreya-sc', 'Alegreya SC', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['aleo', 'Aleo', ["latin","latin-ext","vietnamese"]],
  ['alex-brush', 'Alex Brush', ["latin"]],
  ['alexandria', 'Alexandria', ["arabic","latin","latin-ext","vietnamese"]],
  ['alfa-slab-one', 'Alfa Slab One', ["latin","latin-ext","vietnamese"]],
  ['alice', 'Alice', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['alike', 'Alike', ["latin","latin-ext","math","symbols"]],
  ['allura', 'Allura', ["latin","latin-ext","vietnamese"]],
  ['almarai', 'Almarai', ["arabic","latin"]],
  ['alumni-sans', 'Alumni Sans', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['amatic-sc', 'Amatic SC', ["cyrillic","hebrew","latin","latin-ext","vietnamese"]],
  ['amiko', 'Amiko', ["devanagari","latin","latin-ext"]],
  ['amiri', 'Amiri', ["arabic","latin","latin-ext"]],
  ['amita', 'Amita', ["devanagari","latin","latin-ext"]],
  ['andika', 'Andika', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['anek-telugu', 'Anek Telugu', ["latin","latin-ext","telugu"]],
  ['angkor', 'Angkor', ["khmer","latin"]],
  ['anonymous-pro', 'Anonymous Pro', ["cyrillic","greek","latin","latin-ext"]],
  ['antic', 'Antic', ["latin"]],
  ['antic-slab', 'Antic Slab', ["latin"]],
  ['anton', 'Anton', ["latin","latin-ext","vietnamese"]],
  ['antonio', 'Antonio', ["latin","latin-ext"]],
  ['anuphan', 'Anuphan', ["latin","latin-ext","thai","vietnamese"]],
  ['anybody', 'Anybody', ["latin","latin-ext","vietnamese"]],
  ['arapey', 'Arapey', ["latin"]],
  ['architects-daughter', 'Architects Daughter', ["latin","latin-ext"]],
  ['archivo', 'Archivo', ["latin","latin-ext","vietnamese"]],
  ['archivo-black', 'Archivo Black', ["latin","latin-ext"]],
  ['archivo-narrow', 'Archivo Narrow', ["latin","latin-ext","vietnamese"]],
  ['arimo', 'Arimo', ["cyrillic","cyrillic-ext","greek","greek-ext","hebrew","latin","latin-ext","vietnamese"]],
  ['arsenal', 'Arsenal', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['arvo', 'Arvo', ["latin"]],
  ['asap', 'Asap', ["latin","latin-ext","vietnamese"]],
  ['assistant', 'Assistant', ["hebrew","latin","latin-ext"]],
  ['athiti', 'Athiti', ["latin","latin-ext","thai","vietnamese"]],
  ['atkinson-hyperlegible', 'Atkinson Hyperlegible', ["latin","latin-ext"]],
  ['audiowide', 'Audiowide', ["latin","latin-ext"]],
  ['average', 'Average', ["latin","latin-ext"]],
  ['averia-serif-libre', 'Averia Serif Libre', ["latin"]],
  ['bagel-fat-one', 'Bagel Fat One', ["korean","latin","latin-ext"]],
  ['bai-jamjuree', 'Bai Jamjuree', ["latin","latin-ext","thai","vietnamese"]],
  ['bakbak-one', 'Bakbak One', ["devanagari","latin","latin-ext"]],
  ['baloo-2', 'Baloo 2', ["devanagari","latin","latin-ext","vietnamese"]],
  ['baloo-da-2', 'Baloo Da 2', ["bengali","latin","latin-ext","vietnamese"]],
  ['baloo-tamma-2', 'Baloo Tamma 2', ["kannada","latin","latin-ext","vietnamese"]],
  ['bangers', 'Bangers', ["latin","latin-ext","vietnamese"]],
  ['barlow', 'Barlow', ["latin","latin-ext","vietnamese"]],
  ['barlow-condensed', 'Barlow Condensed', ["latin","latin-ext","vietnamese"]],
  ['barlow-semi-condensed', 'Barlow Semi Condensed', ["latin","latin-ext","vietnamese"]],
  ['baskervville', 'Baskervville', ["latin","latin-ext"]],
  ['be-vietnam-pro', 'Be Vietnam Pro', ["latin","latin-ext","vietnamese"]],
  ['bebas-neue', 'Bebas Neue', ["latin","latin-ext"]],
  ['bellefair', 'Bellefair', ["hebrew","latin","latin-ext"]],
  ['belleza', 'Belleza', ["latin","latin-ext"]],
  ['bentham', 'Bentham', ["latin","latin-ext"]],
  ['besley', 'Besley', ["latin","latin-ext"]],
  ['bevan', 'Bevan', ["latin"]],
  ['bigshot-one', 'Bigshot One', ["latin"]],
  ['bilbo-swash-caps', 'Bilbo Swash Caps', ["latin","latin-ext"]],
  ['bitter', 'Bitter', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['biz-udpgothic', 'BIZ UDPGothic', ["cyrillic","greek-ext","japanese","latin","latin-ext"]],
  ['black-han-sans', 'Black Han Sans', ["latin"]],
  ['black-ops-one', 'Black Ops One', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['bodoni-moda', 'Bodoni Moda', ["latin","latin-ext","math","symbols"]],
  ['bokor', 'Bokor', ["khmer","latin"]],
  ['boldonse', 'Boldonse', ["latin","latin-ext"]],
  ['boogaloo', 'Boogaloo', ["latin"]],
  ['bowlby-one', 'Bowlby One', ["latin"]],
  ['bowlby-one-sc', 'Bowlby One Sc', ["latin"]],
  ['bree-serif', 'Bree Serif', ["latin","latin-ext"]],
  ['bricolage-grotesque', 'Bricolage Grotesque', ["latin","latin-ext","vietnamese"]],
  ['buenard', 'Buenard', ["latin","latin-ext"]],
  ['bungee', 'Bungee', ["latin","latin-ext","vietnamese"]],
  ['bungee-inline', 'Bungee Inline', ["latin"]],
  ['bungee-shade', 'Bungee Shade', ["latin"]],
  ['butcherman', 'Butcherman', ["latin"]],
  ['cabin', 'Cabin', ["latin","latin-ext","vietnamese"]],
  ['cabin-condensed', 'Cabin Condensed', ["latin","latin-ext","vietnamese"]],
  ['cairo', 'Cairo', ["arabic","latin","latin-ext"]],
  ['calistoga', 'Calistoga', ["latin","latin-ext","vietnamese"]],
  ['calligraffitti', 'Calligraffitti', ["latin"]],
  ['cantarell', 'Cantarell', ["latin","latin-ext"]],
  ['cantata-one', 'Cantata One', ["latin","latin-ext"]],
  ['caprasimo', 'Caprasimo', ["latin","latin-ext"]],
  ['cardo', 'Cardo', ["gothic","greek","greek-ext","hebrew","latin","latin-ext","old-italic","runic"]],
  ['carlito', 'Carlito', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['castoro', 'Castoro', ["latin","latin-ext"]],
  ['catamaran', 'Catamaran', ["latin","latin-ext","tamil"]],
  ['caveat', 'Caveat', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['chakra-petch', 'Chakra Petch', ["latin","latin-ext","thai","vietnamese"]],
  ['changa', 'Changa', ["arabic","latin","latin-ext"]],
  ['changa-one', 'Changa One', ["latin"]],
  ['charm', 'Charm', ["latin","latin-ext","thai","vietnamese"]],
  ['charmonman', 'Charmonman', ["latin","latin-ext","thai","vietnamese"]],
  ['chelsea-market', 'Chelsea Market', ["latin","latin-ext"]],
  ['chewy', 'Chewy', ["latin"]],
  ['chiron-goround-tc', 'Chiron GoRound TC', ["chinese-traditional","cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['chivo', 'Chivo', ["latin","latin-ext","vietnamese"]],
  ['chonburi', 'Chonburi', ["latin","latin-ext","thai","vietnamese"]],
  ['cinzel', 'Cinzel', ["latin","latin-ext"]],
  ['cinzel-decorative', 'Cinzel Decorative', ["latin","latin-ext"]],
  ['coda', 'Coda', ["latin","latin-ext"]],
  ['comfortaa', 'Comfortaa', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['coming-soon', 'Coming Soon', ["latin"]],
  ['commissioner', 'Commissioner', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['concert-one', 'Concert One', ["latin","latin-ext"]],
  ['cookie', 'Cookie', ["latin"]],
  ['cormorant', 'Cormorant', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['cormorant-garamond', 'Cormorant Garamond', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['cormorant-infant', 'Cormorant Infant', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['courgette', 'Courgette', ["latin","latin-ext"]],
  ['courier-prime', 'Courier Prime', ["latin","latin-ext"]],
  ['crafty-girls', 'Crafty Girls', ["latin"]],
  ['creepster', 'Creepster', ["latin"]],
  ['crete-round', 'Crete Round', ["latin","latin-ext"]],
  ['crimson-pro', 'Crimson Pro', ["latin","latin-ext","vietnamese"]],
  ['crimson-text', 'Crimson Text', ["latin","latin-ext","vietnamese"]],
  ['cuprum', 'Cuprum', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['cutive-mono', 'Cutive Mono', ["latin"]],
  ['damion', 'Damion', ["latin"]],
  ['dancing-script', 'Dancing Script', ["latin","latin-ext","vietnamese"]],
  ['david-libre', 'David Libre', ["hebrew","latin","latin-ext","math","symbols","vietnamese"]],
  ['delius-unicase', 'Delius Unicase', ["latin"]],
  ['dm-mono', 'DM Mono', ["latin","latin-ext"]],
  ['dm-sans', 'DM Sans', ["latin","latin-ext"]],
  ['dm-serif-display', 'DM Serif Display', ["latin","latin-ext"]],
  ['dm-serif-text', 'DM Serif Text', ["latin","latin-ext"]],
  ['do-hyeon', 'Do Hyeon', ["latin"]],
  ['domine', 'Domine', ["latin","latin-ext"]],
  ['doppio-one', 'Doppio One', ["latin","latin-ext"]],
  ['dosis', 'Dosis', ["latin","latin-ext","vietnamese"]],
  ['dotgothic16', 'DotGothic16', ["cyrillic","japanese","latin","latin-ext"]],
  ['eater', 'Eater', ["latin"]],
  ['eb-garamond', 'EB Garamond', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['eczar', 'Eczar', ["devanagari","greek","greek-ext","latin","latin-ext"]],
  ['electrolize', 'Electrolize', ["latin"]],
  ['encode-sans', 'Encode Sans', ["latin","latin-ext","vietnamese"]],
  ['enriqueta', 'Enriqueta', ["latin","latin-ext"]],
  ['epilogue', 'Epilogue', ["latin","latin-ext","vietnamese"]],
  ['ewert', 'Ewert', ["latin"]],
  ['exo', 'Exo', ["latin","latin-ext","vietnamese"]],
  ['exo-2', 'Exo 2', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['fahkwang', 'Fahkwang', ["latin","latin-ext","thai","vietnamese"]],
  ['faster-one', 'Faster One', ["latin"]],
  ['fasthand', 'Fasthand', ["khmer","latin"]],
  ['figtree', 'Figtree', ["latin","latin-ext"]],
  ['fira-code', 'Fira Code', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","symbols2"]],
  ['fira-mono', 'Fira Mono', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","symbols2"]],
  ['fira-sans', 'Fira Sans', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['fira-sans-condensed', 'Fira Sans Condensed', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['fjalla-one', 'Fjalla One', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['fjord-one', 'Fjord One', ["latin"]],
  ['forum', 'Forum', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['francois-one', 'Francois One', ["latin","latin-ext","vietnamese"]],
  ['frank-ruhl-libre', 'Frank Ruhl Libre', ["hebrew","latin","latin-ext"]],
  ['fraunces', 'Fraunces', ["latin","latin-ext","vietnamese"]],
  ['fredoka', 'Fredoka', ["hebrew","latin","latin-ext"]],
  ['frijole', 'Frijole', ["latin"]],
  ['fugaz-one', 'Fugaz One', ["latin"]],
  ['funnel-display', 'Funnel Display', ["latin","latin-ext"]],
  ['funnel-sans', 'Funnel Sans', ["latin","latin-ext"]],
  ['fuzzy-bubbles', 'Fuzzy Bubbles', ["latin","latin-ext","vietnamese"]],
  ['gaegu', 'Gaegu', ["latin"]],
  ['galada', 'Galada', ["bengali","latin"]],
  ['geist', 'Geist', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['geist-mono', 'Geist Mono', ["cyrillic","cyrillic-ext","latin","latin-ext","symbols2","vietnamese"]],
  ['geo', 'Geo', ["latin"]],
  ['geologica', 'Geologica', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['gloria-hallelujah', 'Gloria Hallelujah', ["latin"]],
  ['gochi-hand', 'Gochi Hand', ["latin"]],
  ['golos-text', 'Golos Text', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['google-sans', 'Google Sans', ["armenian","bengali","canadian-aboriginal","cyrillic","cyrillic-ext","devanagari","ethiopic","georgian","greek","greek-ext","gujarati","gurmukhi","hebrew","khmer","lao","latin","latin-ext","malayalam","oriya","sinhala","symbols","tamil","telugu","thai","vietnamese"]],
  ['google-sans-flex', 'Google Sans Flex', ["canadian-aboriginal","cherokee","latin","latin-ext","math","nushu","symbols","syriac","tifinagh","vietnamese"]],
  ['gothic-a1', 'Gothic A1', ["cyrillic","cyrillic-ext","greek","greek-ext","korean","latin","latin-ext","vietnamese"]],
  ['gotu', 'Gotu', ["devanagari","latin","latin-ext","vietnamese"]],
  ['grandstander', 'Grandstander', ["latin"]],
  ['gravitas-one', 'Gravitas One', ["latin"]],
  ['great-vibes', 'Great Vibes', ["cyrillic","cyrillic-ext","greek-ext","latin","latin-ext","vietnamese"]],
  ['griffy', 'Griffy', ["latin"]],
  ['gruppo', 'Gruppo', ["latin"]],
  ['gurajada', 'Gurajada', ["latin","telugu"]],
  ['hammersmith-one', 'Hammersmith One', ["latin","latin-ext"]],
  ['handjet', 'Handjet', ["latin"]],
  ['handlee', 'Handlee', ["latin"]],
  ['hanken-grotesk', 'Hanken Grotesk', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['heebo', 'Heebo', ["hebrew","latin","latin-ext","math","symbols"]],
  ['henny-penny', 'Henny Penny', ["latin"]],
  ['hind', 'Hind', ["devanagari","latin","latin-ext"]],
  ['hind-guntur', 'Hind Guntur', ["latin","latin-ext","telugu"]],
  ['hind-madurai', 'Hind Madurai', ["latin","latin-ext","tamil"]],
  ['hind-siliguri', 'Hind Siliguri', ["bengali","latin","latin-ext"]],
  ['host-grotesk', 'Host Grotesk', ["latin","latin-ext"]],
  ['hurricane', 'Hurricane', ["latin","latin-ext","vietnamese"]],
  ['ibarra-real-nova', 'Ibarra Real Nova', ["latin","latin-ext"]],
  ['ibm-plex-mono', 'IBM Plex Mono', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['ibm-plex-sans', 'IBM Plex Sans', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['ibm-plex-sans-arabic', 'IBM Plex Sans Arabic', ["arabic","cyrillic-ext","latin","latin-ext"]],
  ['ibm-plex-sans-condensed', 'IBM Plex Sans Condensed', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['ibm-plex-sans-thai', 'IBM Plex Sans Thai', ["cyrillic-ext","latin","latin-ext","thai"]],
  ['ibm-plex-sans-thai-looped', 'IBM Plex Sans Thai Looped', ["cyrillic-ext","latin","latin-ext","thai"]],
  ['ibm-plex-serif', 'IBM Plex Serif', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['iceberg', 'Iceberg', ["latin"]],
  ['iceland', 'Iceland', ["latin"]],
  ['im-fell-dw-pica', 'IM Fell DW Pica', ["latin"]],
  ['im-fell-english-sc', 'IM Fell English SC', ["latin"]],
  ['inclusive-sans', 'Inclusive Sans', ["latin","latin-ext","vietnamese"]],
  ['inconsolata', 'Inconsolata', ["latin","latin-ext","vietnamese"]],
  ['indie-flower', 'Indie Flower', ["latin","latin-ext"]],
  ['inria-sans', 'Inria Sans', ["latin","latin-ext"]],
  ['instrument-sans', 'Instrument Sans', ["latin","latin-ext"]],
  ['instrument-serif', 'Instrument Serif', ["latin","latin-ext"]],
  ['inter', 'Inter', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['inter-tight', 'Inter Tight', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['irish-grover', 'Irish Grover', ["latin"]],
  ['itim', 'Itim', ["latin","latin-ext","thai","vietnamese"]],
  ['jetbrains-mono', 'JetBrains Mono', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['jolly-lodger', 'Jolly Lodger', ["latin"]],
  ['jomhuria', 'Jomhuria', ["arabic","latin","latin-ext"]],
  ['josefin-sans', 'Josefin Sans', ["latin","latin-ext","vietnamese"]],
  ['josefin-slab', 'Josefin Slab', ["latin"]],
  ['jost', 'Jost', ["cyrillic","latin","latin-ext"]],
  ['jua', 'Jua', ["latin"]],
  ['judson', 'Judson', ["latin","latin-ext","vietnamese"]],
  ['julius-sans-one', 'Julius Sans One', ["latin","latin-ext"]],
  ['jura', 'Jura', ["cyrillic","cyrillic-ext","greek","greek-ext","kayah-li","latin","latin-ext","vietnamese"]],
  ['k2d', 'K2D', ["latin","latin-ext","thai","vietnamese"]],
  ['kadwa', 'Kadwa', ["devanagari","latin"]],
  ['kalam', 'Kalam', ["devanagari","latin","latin-ext"]],
  ['kanit', 'Kanit', ["latin","latin-ext","thai","vietnamese"]],
  ['karla', 'Karla', ["latin","latin-ext"]],
  ['kaushan-script', 'Kaushan Script', ["latin","latin-ext"]],
  ['kelly-slab', 'Kelly Slab', ["cyrillic","latin","latin-ext"]],
  ['khand', 'Khand', ["devanagari","latin","latin-ext"]],
  ['kodchasan', 'Kodchasan', ["latin","latin-ext","thai","vietnamese"]],
  ['koho', 'KoHo', ["latin","latin-ext","thai","vietnamese"]],
  ['kosugi-maru', 'Kosugi Maru', ["cyrillic","japanese","latin","latin-ext"]],
  ['kranky', 'Kranky', ["latin"]],
  ['krub', 'Krub', ["latin","latin-ext","thai","vietnamese"]],
  ['kumbh-sans', 'Kumbh Sans', ["latin","latin-ext","math","symbols"]],
  ['laila', 'Laila', ["devanagari","latin","latin-ext"]],
  ['lalezar', 'Lalezar', ["arabic","latin","latin-ext","vietnamese"]],
  ['lato', 'Lato', ["latin","latin-ext"]],
  ['league-gothic', 'League Gothic', ["latin","latin-ext","vietnamese"]],
  ['league-spartan', 'League Spartan', ["latin","latin-ext","vietnamese"]],
  ['lexend', 'Lexend', ["latin","latin-ext","vietnamese"]],
  ['lexend-deca', 'Lexend Deca', ["latin","latin-ext","vietnamese"]],
  ['lexend-giga', 'Lexend Giga', ["latin","latin-ext","vietnamese"]],
  ['lexend-peta', 'Lexend Peta', ["latin","latin-ext","vietnamese"]],
  ['libre-barcode-39', 'Libre Barcode 39', ["latin"]],
  ['libre-barcode-39-text', 'Libre Barcode 39 Text', ["latin"]],
  ['libre-baskerville', 'Libre Baskerville', ["latin","latin-ext"]],
  ['libre-franklin', 'Libre Franklin', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['lilita-one', 'Lilita One', ["latin","latin-ext"]],
  ['line-seed-jp', 'LINE Seed JP', ["cyrillic","greek-ext","japanese","latin","latin-ext"]],
  ['literata', 'Literata', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['livvic', 'Livvic', ["latin","latin-ext","vietnamese"]],
  ['lobster', 'Lobster', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['lobster-two', 'Lobster Two', ["latin"]],
  ['lora', 'Lora', ["cyrillic","cyrillic-ext","latin","latin-ext","math","symbols","vietnamese"]],
  ['luckiest-guy', 'Luckiest Guy', ["latin","latin-ext"]],
  ['lusitana', 'Lusitana', ["latin"]],
  ['lustria', 'Lustria', ["latin"]],
  ['m-plus-1p', 'M PLUS 1p', ["cyrillic","cyrillic-ext","greek","greek-ext","hebrew","japanese","latin","latin-ext","vietnamese"]],
  ['m-plus-rounded-1c', 'M PLUS Rounded 1c', ["cyrillic","cyrillic-ext","greek","greek-ext","hebrew","japanese","latin","latin-ext","vietnamese"]],
  ['macondo', 'Macondo', ["latin"]],
  ['magra', 'Magra', ["latin","latin-ext"]],
  ['maitree', 'Maitree', ["latin","latin-ext","thai","vietnamese"]],
  ['major-mono-display', 'Major Mono Display', ["latin"]],
  ['mali', 'Mali', ["latin","latin-ext","thai","vietnamese"]],
  ['mandali', 'Mandali', ["latin","telugu"]],
  ['manrope', 'Manrope', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['mansalva', 'Mansalva', ["greek","latin","latin-ext","vietnamese"]],
  ['marcellus', 'Marcellus', ["latin","latin-ext"]],
  ['marck-script', 'Marck Script', ["latin"]],
  ['martel', 'Martel', ["devanagari","latin","latin-ext"]],
  ['martian-mono', 'Martian Mono', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['marvel', 'Marvel', ["latin"]],
  ['material-icons', 'Material Icons', ["latin"]],
  ['material-icons-outlined', 'Material Icons Outlined', ["latin"]],
  ['material-icons-round', 'Material Icons Round', ["latin"]],
  ['material-icons-sharp', 'Material Icons Sharp', ["latin"]],
  ['material-icons-two-tone', 'Material Icons Two Tone', ["latin"]],
  ['material-symbols-outlined', 'Material Symbols Outlined', ["latin"]],
  ['material-symbols-rounded', 'Material Symbols Rounded', ["latin"]],
  ['material-symbols-sharp', 'Material Symbols Sharp', ["latin"]],
  ['maven-pro', 'Maven Pro', ["latin","latin-ext","vietnamese"]],
  ['medievalsharp', 'MedievalSharp', ["latin","latin-ext"]],
  ['merienda', 'Merienda', ["latin","latin-ext","vietnamese"]],
  ['merriweather', 'Merriweather', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['merriweather-sans', 'Merriweather Sans', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['metal-mania', 'Metal Mania', ["latin"]],
  ['michroma', 'Michroma', ["latin","latin-ext"]],
  ['miriam-libre', 'Miriam Libre', ["hebrew","latin","latin-ext"]],
  ['mitr', 'Mitr', ["latin","latin-ext","thai","vietnamese"]],
  ['mochiy-pop-one', 'Mochiy Pop One', ["japanese","latin"]],
  ['modak', 'Modak', ["latin"]],
  ['modern-antiqua', 'Modern Antiqua', ["latin","latin-ext"]],
  ['monoton', 'Monoton', ["latin"]],
  ['montserrat', 'Montserrat', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['montserrat-alternates', 'Montserrat Alternates', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['mooli', 'Mooli', ["latin","latin-ext"]],
  ['mr-de-haviland', 'Mr De Haviland', ["latin","latin-ext"]],
  ['mukta', 'Mukta', ["devanagari","latin","latin-ext"]],
  ['mukta-malar', 'Mukta Malar', ["latin","latin-ext","tamil"]],
  ['mulish', 'Mulish', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['murecho', 'Murecho', ["cyrillic","cyrillic-ext","greek","japanese","latin","latin-ext"]],
  ['museomoderno', 'MuseoModerno', ["latin","latin-ext","vietnamese"]],
  ['nanum-gothic', 'Nanum Gothic', ["korean","latin"]],
  ['nanum-gothic-coding', 'Nanum Gothic Coding', ["korean","latin"]],
  ['nanum-myeongjo', 'Nanum Myeongjo', ["korean","latin"]],
  ['nerko-one', 'Nerko One', ["latin","latin-ext"]],
  ['neucha', 'Neucha', ["cyrillic","latin"]],
  ['new-rocker', 'New Rocker', ["latin"]],
  ['news-cycle', 'News Cycle', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['newsreader', 'Newsreader', ["latin","latin-ext","vietnamese"]],
  ['niconne', 'Niconne', ["latin"]],
  ['niramit', 'Niramit', ["latin","latin-ext","thai","vietnamese"]],
  ['norican', 'Norican', ["latin"]],
  ['nosifer', 'Nosifer', ["latin"]],
  ['nothing-you-could-do', 'Nothing You Could Do', ["latin"]],
  ['noticia-text', 'Noticia Text', ["latin","latin-ext","vietnamese"]],
  ['noto-color-emoji', 'Noto Color Emoji', ["emoji"]],
  ['noto-emoji', 'Noto Emoji', ["emoji"]],
  ['noto-kufi-arabic', 'Noto Kufi Arabic', ["arabic","latin","latin-ext","math","symbols"]],
  ['noto-naskh-arabic', 'Noto Naskh Arabic', ["arabic","latin","latin-ext","math","symbols"]],
  ['noto-nastaliq-urdu', 'Noto Nastaliq Urdu', ["arabic","latin","latin-ext"]],
  ['noto-sans', 'Noto Sans', ["cyrillic","cyrillic-ext","devanagari","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['noto-sans-arabic', 'Noto Sans Arabic', ["arabic","latin","latin-ext","math","symbols"]],
  ['noto-sans-bengali', 'Noto Sans Bengali', ["bengali","latin","latin-ext"]],
  ['noto-sans-devanagari', 'Noto Sans Devanagari', ["devanagari","latin","latin-ext"]],
  ['noto-sans-display', 'Noto Sans Display', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['noto-sans-georgian', 'Noto Sans Georgian', ["cyrillic-ext","georgian","greek-ext","latin","latin-ext","math","symbols"]],
  ['noto-sans-gujarati', 'Noto Sans Gujarati', ["gujarati","latin","latin-ext","math","symbols"]],
  ['noto-sans-gurmukhi', 'Noto Sans Gurmukhi', ["gurmukhi","latin","latin-ext"]],
  ['noto-sans-hebrew', 'Noto Sans Hebrew', ["cyrillic-ext","greek-ext","hebrew","latin","latin-ext"]],
  ['noto-sans-jp', 'Noto Sans JP', ["cyrillic","japanese","latin","latin-ext","vietnamese"]],
  ['noto-sans-khmer', 'Noto Sans Khmer', ["khmer","latin","latin-ext"]],
  ['noto-sans-kr', 'Noto Sans KR', ["cyrillic","korean","latin","latin-ext","vietnamese"]],
  ['noto-sans-lao', 'Noto Sans Lao', ["lao","latin","latin-ext"]],
  ['noto-sans-mono', 'Noto Sans Mono', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['noto-sans-myanmar', 'Noto Sans Myanmar', ["latin","latin-ext","myanmar"]],
  ['noto-sans-sc', 'Noto Sans SC', ["chinese-simplified","cyrillic","latin","latin-ext","vietnamese"]],
  ['noto-sans-symbols', 'Noto Sans Symbols', ["latin","latin-ext","symbols"]],
  ['noto-sans-tamil', 'Noto Sans Tamil', ["latin","latin-ext","tamil"]],
  ['noto-sans-tc', 'Noto Sans TC', ["chinese-traditional","cyrillic","latin","latin-ext","vietnamese"]],
  ['noto-sans-telugu', 'Noto Sans Telugu', ["latin","latin-ext","telugu"]],
  ['noto-sans-thai', 'Noto Sans Thai', ["latin","latin-ext","thai"]],
  ['noto-sans-thai-looped', 'Noto Sans Thai Looped', ["latin","latin-ext","thai"]],
  ['noto-serif', 'Noto Serif', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","math","vietnamese"]],
  ['noto-serif-devanagari', 'Noto Serif Devanagari', ["devanagari","latin","latin-ext"]],
  ['noto-serif-georgian', 'Noto Serif Georgian', ["georgian","latin","latin-ext"]],
  ['noto-serif-jp', 'Noto Serif JP', ["cyrillic","japanese","latin","latin-ext","vietnamese"]],
  ['noto-serif-kr', 'Noto Serif KR', ["cyrillic","korean","latin","latin-ext","vietnamese"]],
  ['noto-serif-sc', 'Noto Serif SC', ["chinese-simplified","cyrillic","latin","latin-ext","vietnamese"]],
  ['noto-serif-tc', 'Noto Serif TC', ["chinese-traditional","cyrillic","latin","latin-ext","vietnamese"]],
  ['noto-serif-thai', 'Noto Serif Thai', ["latin","latin-ext","thai"]],
  ['nova-mono', 'Nova Mono', ["latin"]],
  ['nova-square', 'Nova Square', ["latin"]],
  ['nunito', 'Nunito', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['nunito-sans', 'Nunito Sans', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['old-standard-tt', 'Old Standard TT', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['oleo-script', 'Oleo Script', ["latin","latin-ext"]],
  ['onest', 'Onest', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['open-sans', 'Open Sans', ["cyrillic","cyrillic-ext","greek","greek-ext","hebrew","latin","latin-ext","math","symbols","vietnamese"]],
  ['oranienbaum', 'Oranienbaum', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['orbitron', 'Orbitron', ["latin"]],
  ['oswald', 'Oswald', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['outfit', 'Outfit', ["latin","latin-ext"]],
  ['overlock', 'Overlock', ["latin","latin-ext"]],
  ['overpass', 'Overpass', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['oxanium', 'Oxanium', ["latin","latin-ext"]],
  ['oxygen', 'Oxygen', ["latin","latin-ext"]],
  ['oxygen-mono', 'Oxygen Mono', ["latin","latin-ext"]],
  ['pacifico', 'Pacifico', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['pangolin', 'Pangolin', ["latin"]],
  ['parisienne', 'Parisienne', ["latin","latin-ext"]],
  ['passion-one', 'Passion One', ["latin","latin-ext"]],
  ['pathway-extreme', 'Pathway Extreme', ["latin","latin-ext","vietnamese"]],
  ['patrick-hand', 'Patrick Hand', ["latin","latin-ext","vietnamese"]],
  ['pattaya', 'Pattaya', ["cyrillic","latin","latin-ext","thai","vietnamese"]],
  ['patua-one', 'Patua One', ["latin"]],
  ['paytone-one', 'Paytone One', ["latin","latin-ext","vietnamese"]],
  ['permanent-marker', 'Permanent Marker', ["latin"]],
  ['petit-formal-script', 'Petit Formal Script', ["latin","latin-ext"]],
  ['philosopher', 'Philosopher', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['piazzolla', 'Piazzolla', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['pirata-one', 'Pirata One', ["latin"]],
  ['pixelify-sans', 'Pixelify Sans', ["latin"]],
  ['play', 'Play', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['playfair', 'Playfair', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['playfair-display', 'Playfair Display', ["cyrillic","latin","latin-ext","vietnamese"]],
  ['playpen-sans', 'Playpen Sans', ["cyrillic","cyrillic-ext","emoji","greek","latin","latin-ext","math","vietnamese"]],
  ['playpen-sans-thai', 'Playpen Sans Thai', ["emoji","latin","latin-ext","math","thai"]],
  ['plus-jakarta-sans', 'Plus Jakarta Sans', ["cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['poetsen-one', 'Poetsen One', ["latin","latin-ext"]],
  ['poller-one', 'Poller One', ["latin"]],
  ['poltawski-nowy', 'Poltawski Nowy', ["latin","latin-ext","vietnamese"]],
  ['poppins', 'Poppins', ["devanagari","latin","latin-ext"]],
  ['prata', 'Prata', ["cyrillic","cyrillic-ext","latin","vietnamese"]],
  ['press-start-2p', 'Press Start 2P', ["cyrillic","cyrillic-ext","greek","latin","latin-ext"]],
  ['pridi', 'Pridi', ["latin","latin-ext","thai","vietnamese"]],
  ['prompt', 'Prompt', ["latin","latin-ext","thai","vietnamese"]],
  ['protest-strike', 'Protest Strike', ["latin","latin-ext","math","symbols","vietnamese"]],
  ['pt-mono', 'PT Mono', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['pt-sans', 'PT Sans', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['pt-sans-caption', 'PT Sans Caption', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['pt-sans-narrow', 'PT Sans Narrow', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['pt-serif', 'PT Serif', ["cyrillic","cyrillic-ext","latin","latin-ext"]],
  ['public-sans', 'Public Sans', ["latin","latin-ext","vietnamese"]],
  ['quantico', 'Quantico', ["latin"]],
  ['quattrocento', 'Quattrocento', ["latin","latin-ext"]],
  ['questrial', 'Questrial', ["latin","latin-ext","vietnamese"]],
  ['quicksand', 'Quicksand', ["latin","latin-ext","vietnamese"]],
  ['qwigley', 'Qwigley', ["latin","latin-ext","vietnamese"]],
  ['racing-sans-one', 'Racing Sans One', ["latin"]],
  ['rajdhani', 'Rajdhani', ["devanagari","latin","latin-ext"]],
  ['raleway', 'Raleway', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['ramabhadra', 'Ramabhadra', ["latin","telugu"]],
  ['rammetto-one', 'Rammetto One', ["latin","latin-ext"]],
  ['ranchers', 'Ranchers', ["latin"]],
  ['readex-pro', 'Readex Pro', ["arabic","latin","latin-ext","vietnamese"]],
  ['red-hat-display', 'Red Hat Display', ["latin","latin-ext"]],
  ['red-hat-text', 'Red Hat Text', ["latin","latin-ext"]],
  ['red-rose', 'Red Rose', ["latin","latin-ext","vietnamese"]],
  ['reddit-sans-condensed', 'Reddit Sans Condensed', ["latin","latin-ext","vietnamese"]],
  ['reenie-beanie', 'Reenie Beanie', ["latin"]],
  ['rethink-sans', 'Rethink Sans', ["latin","latin-ext"]],
  ['righteous', 'Righteous', ["latin","latin-ext"]],
  ['roboto', 'Roboto', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","math","symbols","vietnamese"]],
  ['roboto-condensed', 'Roboto Condensed', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['roboto-flex', 'Roboto Flex', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['roboto-mono', 'Roboto Mono', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['roboto-serif', 'Roboto Serif', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['roboto-slab', 'Roboto Slab', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['rochester', 'Rochester', ["latin"]],
  ['rock-salt', 'Rock Salt', ["latin"]],
  ['rocknroll-one', 'RocknRoll One', ["japanese","latin","latin-ext"]],
  ['rokkitt', 'Rokkitt', ["latin"]],
  ['rowdies', 'Rowdies', ["latin","latin-ext","vietnamese"]],
  ['rubik', 'Rubik', ["arabic","cyrillic","cyrillic-ext","hebrew","latin","latin-ext"]],
  ['rubik-dirt', 'Rubik Dirt', ["cyrillic","cyrillic-ext","hebrew","latin","latin-ext"]],
  ['rubik-glitch', 'Rubik Glitch', ["cyrillic","cyrillic-ext","hebrew","latin","latin-ext"]],
  ['rubik-mono-one', 'Rubik Mono One', ["cyrillic","latin","latin-ext"]],
  ['russo-one', 'Russo One', ["cyrillic","latin","latin-ext"]],
  ['rye', 'Rye', ["latin"]],
  ['sacramento', 'Sacramento', ["latin","latin-ext"]],
  ['saira', 'Saira', ["latin","latin-ext","vietnamese"]],
  ['saira-condensed', 'Saira Condensed', ["latin","latin-ext","vietnamese"]],
  ['saira-semi-condensed', 'Saira Semi Condensed', ["latin","latin-ext","vietnamese"]],
  ['sanchez', 'Sanchez', ["latin"]],
  ['sansita-swashed', 'Sansita Swashed', ["latin"]],
  ['sarabun', 'Sarabun', ["latin","latin-ext","thai","vietnamese"]],
  ['sarina', 'Sarina', ["latin","latin-ext"]],
  ['sarpanch', 'Sarpanch', ["devanagari","latin","latin-ext"]],
  ['satisfy', 'Satisfy', ["latin"]],
  ['sawarabi-gothic', 'Sawarabi Gothic', ["cyrillic","japanese","latin","latin-ext","vietnamese"]],
  ['sawarabi-mincho', 'Sawarabi Mincho', ["braille","japanese","latin","latin-ext"]],
  ['schibsted-grotesk', 'Schibsted Grotesk', ["latin","latin-ext"]],
  ['schoolbell', 'Schoolbell', ["latin"]],
  ['seaweed-script', 'Seaweed Script', ["latin","latin-ext"]],
  ['sen', 'Sen', ["latin","latin-ext"]],
  ['shadows-into-light', 'Shadows Into Light', ["latin","latin-ext"]],
  ['share-tech', 'Share Tech', ["latin"]],
  ['share-tech-mono', 'Share Tech Mono', ["latin"]],
  ['shippori-mincho', 'Shippori Mincho', ["japanese","latin","latin-ext"]],
  ['shojumaru', 'Shojumaru', ["latin"]],
  ['shrikhand', 'Shrikhand', ["gujarati","latin","latin-ext"]],
  ['sigmar-one', 'Sigmar One', ["latin","latin-ext","vietnamese"]],
  ['signika', 'Signika', ["latin","latin-ext","vietnamese"]],
  ['signika-negative', 'Signika Negative', ["latin","latin-ext","vietnamese"]],
  ['silkscreen', 'Silkscreen', ["latin","latin-ext"]],
  ['slabo-13px', 'Slabo 13px', ["latin","latin-ext"]],
  ['slabo-27px', 'Slabo 27px', ["latin","latin-ext"]],
  ['smooch-sans', 'Smooch Sans', ["latin","latin-ext","vietnamese"]],
  ['sniglet', 'Sniglet', ["latin"]],
  ['sofia-sans', 'Sofia Sans', ["cyrillic","cyrillic-ext","greek","latin","latin-ext"]],
  ['sofia-sans-condensed', 'Sofia Sans Condensed', ["cyrillic","cyrillic-ext","greek","latin","latin-ext"]],
  ['solway', 'Solway', ["latin"]],
  ['sometype-mono', 'Sometype Mono', ["latin","latin-ext"]],
  ['song-myung', 'Song Myung', ["korean"]],
  ['sora', 'Sora', ["latin","latin-ext"]],
  ['source-code-pro', 'Source Code Pro', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['source-sans-3', 'Source Sans 3', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext","vietnamese"]],
  ['source-serif-4', 'Source Serif 4', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['space-grotesk', 'Space Grotesk', ["latin","latin-ext","vietnamese"]],
  ['space-mono', 'Space Mono', ["latin","latin-ext","vietnamese"]],
  ['special-elite', 'Special Elite', ["latin","latin-ext"]],
  ['special-gothic-condensed-one', 'Special Gothic Condensed One', ["latin","latin-ext"]],
  ['special-gothic-expanded-one', 'Special Gothic Expanded One', ["latin","latin-ext"]],
  ['spectral', 'Spectral', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['spinnaker', 'Spinnaker', ["latin","latin-ext"]],
  ['squada-one', 'Squada One', ["latin"]],
  ['sriracha', 'Sriracha', ["latin","latin-ext","thai","vietnamese"]],
  ['srisakdi', 'Srisakdi', ["latin","latin-ext","thai","vietnamese"]],
  ['staatliches', 'Staatliches', ["latin"]],
  ['stick-no-bills', 'Stick No Bills', ["latin","latin-ext","sinhala"]],
  ['stix-two-text', 'STIX Two Text', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['syncopate', 'Syncopate', ["latin"]],
  ['syne', 'Syne', ["greek","latin","latin-ext"]],
  ['tajawal', 'Tajawal', ["arabic","latin"]],
  ['tangerine', 'Tangerine', ["latin"]],
  ['taviraj', 'Taviraj', ["latin","latin-ext","thai","vietnamese"]],
  ['teachers', 'Teachers', ["greek-ext","latin","latin-ext"]],
  ['teko', 'Teko', ["devanagari","latin","latin-ext"]],
  ['tektur', 'Tektur', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['tenor-sans', 'Tenor Sans', ["cyrillic","latin","latin-ext"]],
  ['thasadith', 'Thasadith', ["latin","latin-ext","thai","vietnamese"]],
  ['the-girl-next-door', 'The Girl Next Door', ["latin","latin-ext"]],
  ['tinos', 'Tinos', ["cyrillic","cyrillic-ext","greek","greek-ext","hebrew","latin","latin-ext","vietnamese"]],
  ['titan-one', 'Titan One', ["latin","latin-ext"]],
  ['titillium-web', 'Titillium Web', ["latin","latin-ext"]],
  ['train-one', 'Train One', ["cyrillic","japanese","latin","latin-ext"]],
  ['trirong', 'Trirong', ["latin","latin-ext","thai","vietnamese"]],
  ['turret-road', 'Turret Road', ["latin"]],
  ['ubuntu', 'Ubuntu', ["cyrillic","cyrillic-ext","greek","greek-ext","latin","latin-ext"]],
  ['ultra', 'Ultra', ["latin","latin-ext"]],
  ['unbounded', 'Unbounded', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['unifrakturcook', 'UnifrakturCook', ["latin"]],
  ['unifrakturmaguntia', 'UnifrakturMaguntia', ["latin"]],
  ['unna', 'Unna', ["latin","latin-ext"]],
  ['urbanist', 'Urbanist', ["latin","latin-ext"]],
  ['varela-round', 'Varela Round', ["hebrew","latin","latin-ext","vietnamese"]],
  ['viga', 'Viga', ["latin","latin-ext"]],
  ['volkhov', 'Volkhov', ["latin"]],
  ['vollkorn', 'Vollkorn', ["cyrillic","cyrillic-ext","greek","latin","latin-ext","vietnamese"]],
  ['voltaire', 'Voltaire', ["latin","latin-ext","vietnamese"]],
  ['vt323', 'VT323', ["latin","latin-ext","vietnamese"]],
  ['vujahday-script', 'Vujahday Script', ["latin","latin-ext","vietnamese"]],
  ['wallpoet', 'Wallpoet', ["latin"]],
  ['wendy-one', 'Wendy One', ["latin","latin-ext"]],
  ['wix-madefor-display', 'Wix Madefor Display', ["cyrillic","cyrillic-ext","latin","latin-ext","vietnamese"]],
  ['work-sans', 'Work Sans', ["latin","latin-ext","vietnamese"]],
  ['yanone-kaffeesatz', 'Yanone Kaffeesatz', ["cyrillic","cyrillic-ext","latin","latin-ext","math","symbols","vietnamese"]],
  ['yantramanav', 'Yantramanav', ["devanagari","latin","latin-ext"]],
  ['yellowtail', 'Yellowtail', ["latin","latin-ext"]],
  ['yeseva-one', 'Yeseva One', ["latin"]],
  ['young-serif', 'Young Serif', ["latin","latin-ext"]],
  ['yusei-magic', 'Yusei Magic', ["japanese","latin","latin-ext"]],
  ['zcool-xiaowei', 'ZCOOL XiaoWei', ["chinese-simplified","latin"]],
  ['zen-dots', 'Zen Dots', ["latin"]],
  ['zen-kaku-gothic-antique', 'Zen Kaku Gothic Antique', ["cyrillic","japanese","latin","latin-ext"]],
  ['zen-kaku-gothic-new', 'Zen Kaku Gothic New', ["cyrillic","japanese","latin","latin-ext"]],
  ['zen-maru-gothic', 'Zen Maru Gothic', ["cyrillic","greek","japanese","latin","latin-ext"]],
  ['zen-old-mincho', 'Zen Old Mincho', ["cyrillic","greek","japanese","latin","latin-ext"]],
  ['zeyada', 'Zeyada', ["latin","latin-ext"]],
  ['zilla-slab', 'Zilla Slab', ["latin","latin-ext"]]
];

let bundledLoaded = false;
export async function loadBundledFonts(onLoaded?: (option: FontOption) => void) {
  if (bundledLoaded) return;
  bundledLoaded = true;
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Inject @font-face rules so we can preview the fonts in the UI
  const fontFaceStyles = BUNDLED_TTF.map(([slug]) => `
    @font-face {
      font-family: '${slug}';
      src: url('${baseUrl}fonts/${slug}.ttf') format('truetype');
    }
  `).join('\n');
  const styleEl = document.createElement('style');
  styleEl.textContent = fontFaceStyles;
  document.head.appendChild(styleEl);

  for (const [slug, name, subsets] of BUNDLED_TTF) {
    try {
      const buf = await fetch(`${baseUrl}fonts/${slug}.ttf`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      });
      const parsedTTF = ttfLoader.parse(buf);
      const font = fontLoader.parse(parsedTTF);
      const option = { id: `bundled-${slug}`, name, font, subsets };
      FONT_OPTIONS.push(option);
      onLoaded?.(option);
    } catch (e: any) {
      console.warn(`Could not load font "${name}":`, e.message);
    }
  }
}

function uniqueFontId(base: string): string {
  const slug = base
    .replace(/\.[^.]+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'imported-font';
  let id = `imported-${slug}`;
  let suffix = 2;
  while (FONT_OPTIONS.some((font) => font.id === id)) {
    id = `imported-${slug}-${suffix}`;
    suffix++;
  }
  return id;
}

function fontNameFromData(data: any, fallback: string): string {
  return data.familyName || data.original_font_information?.fullName?.en || fallback;
}

export async function importFontFile(file: File): Promise<FontOption> {
  const isJson = /\.json$/i.test(file.name);
  const data = isJson
    ? JSON.parse(await file.text())
    : ttfLoader.parse(await file.arrayBuffer());
  const option = {
    id: uniqueFontId(file.name),
    name: fontNameFromData(data, file.name.replace(/\.[^.]+$/g, '')),
    font: fontLoader.parse(data),
    imported: true,
  };
  FONT_OPTIONS.push(option);
  return option;
}

/**
 * Build a RegionSet from text.
 * @param separate  When false (default) every letter is merged into one element so the
 *   whole word selects/recolors/extrudes together. When true each glyph becomes its own
 *   region (part `top-color-{k}-0`), so letters can be picked and colored individually.
 */
export function parseLetter(text: string, fontId: string, maxLen = 30, separate = false): RegionSet {
  if (!text.trim()) throw new Error('Type a letter first.');

  const option = FONT_OPTIONS.find((font) => font.id === fontId) || FONT_OPTIONS[0];
  // Each glyph is a group of rings (its outline + any holes), kept grouped so we can
  // either merge them all into one element or expose each letter on its own.
  const glyphs: Ring[][] = [];
  const box = new THREE.Box2(
    new THREE.Vector2(Infinity, Infinity),
    new THREE.Vector2(-Infinity, -Infinity)
  );

  const lines = text.split('\n');
  let currentY = 0;

  for (const rawLine of lines) {
    const value = Array.from((rawLine || '').trim()).slice(0, maxLen).join('');
    if (!value) continue;

    const shapes = option.font.generateShapes(value, 100);
    const lineBox = new THREE.Box2(
      new THREE.Vector2(Infinity, Infinity),
      new THREE.Vector2(-Infinity, -Infinity)
    );
    const lineGlyphs: Ring[][] = [];

    for (const shape of shapes) {
      const extracted = shape.extractPoints(16);
      const glyphRings: Ring[] = [];
      if (extracted.shape.length >= 3) {
        const ring: Ring = [];
        for (const p of extracted.shape) {
          lineBox.expandByPoint(p);
          ring.push([p.x, p.y]);
        }
        glyphRings.push(ring);
      }
      for (const hole of extracted.holes) {
        if (hole.length >= 3) {
          const ring: Ring = [];
          for (const p of hole) {
            lineBox.expandByPoint(p);
            ring.push([p.x, p.y]);
          }
          glyphRings.push(ring);
        }
      }
      if (glyphRings.length) lineGlyphs.push(glyphRings);
    }

    if (lineGlyphs.length === 0) continue;

    const lineWidth = lineBox.max.x - lineBox.min.x;
    const offsetX = -(lineBox.min.x + lineWidth / 2);

    for (const glyphRings of lineGlyphs) {
      for (const ring of glyphRings) {
        for (const pt of ring) {
          pt[0] += offsetX;
          pt[1] += currentY;
          box.expandByPoint(new THREE.Vector2(pt[0], pt[1]));
        }
      }
      glyphs.push(glyphRings);
    }

    currentY -= 130; // Move down for the next line
  }

  if (!glyphs.length) throw new Error('No drawable outlines found in this font.');

  const cx = (box.min.x + box.max.x) / 2;
  const cy = (box.min.y + box.max.y) / 2;
  const dx = box.max.x - box.min.x;
  const dy = box.max.y - box.min.y;
  const maxSide = Math.max(dx, dy) || 1;
  const aspect = dy !== 0 ? dx / dy : 1;

  const normalizeRing = (r: Ring): Ring =>
    r.map(([x, y]) => [
      (x - cx) / maxSide,
      (y - cy) / maxSide // keep Y-up
    ]);

  // Default text color is off-white (#f7f7f5)
  const OFFWHITE: RGB = [247, 247, 245];
  const outline = glyphs.flat().map(normalizeRing);

  const regions = separate
    ? glyphs.map((glyphRings) => ({
        quantRgb: OFFWHITE,
        components: [{ rings: glyphRings.map(normalizeRing), coverage: 1.0 }],
        coverage: 1.0,
      }))
    : [{
        quantRgb: OFFWHITE,
        components: [{ rings: outline, coverage: 1.0 }],
        coverage: 1.0,
      }];

  return { regions, outline, aspect };
}
