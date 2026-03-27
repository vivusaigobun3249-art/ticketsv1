import { createI18n } from "vue-i18n";

import en from "./en.json";
import vi from "./vi.json";
import tw from "./tw.json";
import th from "./th.json";
import my from "./my.json";
import mm from "./mm.json";
import fr from "./fr.json";
import es from "./es.json";
import pt from "./pt.json";
import br from "./br.json";
import mx from "./mx.json";
import kr from "./kr.json";
import jp from "./jp.json";
import id from "./id.json";
import india from "./in.json";

const SUPPORTED_LOCALES = ["en", "vi", "tw","th","my","fr","es","pt","br","mx","mm","kr","jp","in","india"];

const savedLocale = localStorage.getItem("locale");
const locale = SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : "en";

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: "en",
    messages: {
        en,
        vi,
        tw,
        th,
        my,
        mm,
        fr,
        es,
        pt,
        br,
        mx,
        kr,
        jp,
        india,
        id,
    },
});

export { SUPPORTED_LOCALES };
