import { Language } from "./translations";

/**
 * Automatically generates the official agricultural department / administration name
 * based on selected region, district/city, and active language.
 */
export function generateDefaultOrganization(
  region: string,
  district: string,
  lang: Language
): string {
  if (!region && !district) {
    return "";
  }

  if (lang === "tg") {
    // Tajik Language
    if (district) {
      if (district.startsWith("ш. ")) {
        const cityName = district.replace(/^ш\.\s*/, "");
        return `Раёсати кишоварзии шаҳри ${cityName}`;
      }
      if (district.startsWith("ноҳияи ")) {
        return `Раёсати кишоварзии ${district}`;
      }
      return `Раёсати кишоварзии ноҳияи ${district}`;
    }

    // Only Region selected
    if (region.includes("Суғд") || region.includes("Согдийск")) {
      return "Сарраёсати кишоварзии вилояти Суғд";
    }
    if (region.includes("Хатлон")) {
      return "Сарраёсати кишоварзии вилояти Хатлон";
    }
    if (region.includes("Бадахшон") || region.includes("Бадахшан") || region.includes("ГБАО") || region.includes("ВМКБ")) {
      return "Сарраёсати кишоварзии Вилояти Мухтори Кӯҳистони Бадахшон";
    }
    if (region.includes("Душанбе")) {
      return "Сарраёсати кишоварзии шаҳри Душанбе";
    }
    if (region.includes("НТҶ") || region.includes("тобеи ҷумҳурӣ") || region.includes("РРП") || region.includes("республиканск")) {
      return "Раёсати кишоварзии ноҳияҳои тобеи ҷумҳурӣ";
    }
    return `Раёсати кишоварзии ${region}`;
  } else {
    // Russian Language
    if (district) {
      if (district.startsWith("г. ") || district.startsWith("ш. ")) {
        const cityName = district.replace(/^(г|ш)\.\s*/, "");
        return `Управление сельского хозяйства города ${cityName}`;
      }
      if (district.endsWith("район")) {
        const districtGenitive = district
          .replace(/овский район$/, "овского района")
          .replace(/евский район$/, "евского района")
          .replace(/ский район$/, "ского района")
          .replace(/цкий район$/, "цкого района")
          .replace(/ район$/, " района");
        return `Управление сельского хозяйства ${districtGenitive}`;
      }
      if (district.startsWith("Район ")) {
        const districtName = district.replace(/^Район\s+/, "");
        return `Управление сельского хозяйства района ${districtName}`;
      }
      if (district.startsWith("ноҳияи ")) {
        const districtName = district.replace(/^ноҳияи\s+/, "");
        return `Управление сельского хозяйства района ${districtName}`;
      }
      return `Управление сельского хозяйства района ${district}`;
    }

    // Only Region selected
    if (region.includes("Согдийск") || region.includes("Суғд")) {
      return "Главное управление сельского хозяйства Согдийской области";
    }
    if (region.includes("Хатлон")) {
      return "Главное управление сельского хозяйства Хатлонской области";
    }
    if (region.includes("ГБАО") || region.includes("Бадахшан") || region.includes("Бадахшон") || region.includes("ВМКБ")) {
      return "Главное управление сельского хозяйства Горно-Бадахшанской АО";
    }
    if (region.includes("Душанбе")) {
      return "Управление сельского хозяйства города Душанбе";
    }
    if (region.includes("РРП") || region.includes("республиканск") || region.includes("НТҶ") || region.includes("тобеи ҷумҳурӣ")) {
      return "Управление сельского хозяйства районов республиканского подчинения";
    }
    return `Управление сельского хозяйства ${region}`;
  }
}

