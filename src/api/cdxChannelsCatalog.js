import { apiCache } from './cache';

/**
 * Standard iframe embed template helper
 */
export const createCdxIframeEmbed = (embedUrl) => {
  return `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
};

/**
 * Complete Master Verified Catalog of 168 Channels (Sports, Entertainment, Movies, Cartoons, News)
 * Direct href /channel/:slug routing with verified CDX embeds and multi-mirror failover
 */
export const CDX_USA_WORLD_CHANNELS = [
  {
    "id": "cdx_abc",
    "slug": "abc",
    "cdxSlug": "abc-usa",
    "name": "ABC",
    "title": "ABC",
    "image": "https://cdn.abcotvs.com/dip/images/11479454_011822-cc-abc-generic-thumb-img.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/abc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/abc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ABC (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/abc-usa",
        "type": "0"
      },
      {
        "title": "ABC (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/abc/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_acc_network",
    "slug": "acc-network",
    "cdxSlug": "accn-usa",
    "name": "ACC Network",
    "title": "ACC Network",
    "image": "https://theacc.com/images/2018/11/30/ACCN_Launch.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/accn-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/accn-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ACC Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/accn-usa",
        "type": "0"
      },
      {
        "title": "ACC Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/acc-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_ae_network",
    "slug": "ae-network",
    "cdxSlug": "ae-usa",
    "name": "AE",
    "title": "AE",
    "image": "https://www.aetv.com/assets/images/aetv/generic-thumb.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/ae-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/ae-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "AE (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/ae-usa",
        "type": "0"
      },
      {
        "title": "AE (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/ae-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_amc",
    "slug": "amc",
    "cdxSlug": "amc-usa",
    "name": "AMC",
    "title": "AMC",
    "image": "https://tvseriesfinale.com/wp-content/uploads/2014/08/amc02.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/amc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/amc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "AMC (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/amc-usa",
        "type": "0"
      },
      {
        "title": "AMC (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/amc/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_american_heroes_channel",
    "slug": "american-heroes-channel",
    "cdxSlug": "ahc-usa",
    "name": "American Heroes Channel",
    "title": "American Heroes Channel",
    "image": "https://payload.cargocollective.com/1/10/342209/9724942/AHC_15a_3_1340_c.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/ahc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/ahc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "American Heroes Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/ahc-usa",
        "type": "0"
      },
      {
        "title": "American Heroes Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/american-heroes-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_animal_planet",
    "slug": "animal-planet",
    "cdxSlug": "animalplanet-usa",
    "name": "Animal Planet",
    "title": "Animal Planet",
    "image": "https://mir-s3-cdn-cf.behance.net/project_modules/disp/f9ee57107702215.5facf9f601507.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/animalplanet-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/animalplanet-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Animal Planet (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/animalplanet-usa",
        "type": "0"
      },
      {
        "title": "Animal Planet (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/animal-planet/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_axs_tv",
    "slug": "axs-tv",
    "cdxSlug": "axs-usa",
    "name": "AXS TV",
    "title": "AXS TV",
    "image": "https://www.hcc.net/wp-content/uploads/2012/06/AXS_TV_BlueWhite.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/axs-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/axs-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "AXS TV (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/axs-usa",
        "type": "0"
      },
      {
        "title": "AXS TV (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/axs-tv/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bbc_america",
    "slug": "bbc-america",
    "cdxSlug": "bbc-usa",
    "name": "BBC America",
    "title": "BBC America",
    "image": "https://www.newscaststudio.com/wp-content/uploads/2024/11/bbc-america-logo.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/bbc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/bbc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "BBC America (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/bbc-usa",
        "type": "0"
      },
      {
        "title": "BBC America (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bbc-america/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bbc_one_london",
    "slug": "bbc-one-london",
    "cdxSlug": "bbcone-uk",
    "name": "BBC One London",
    "title": "BBC One London",
    "image": "https://ichef.bbci.co.uk/images/ic/1200x675/p0dkt7rv.jpg",
    "flag": "gb",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/bbcone-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/bbcone-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "BBC One London (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/bbcone-uk",
        "type": "0"
      },
      {
        "title": "BBC One London (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bbc-one-london/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bbc_two",
    "slug": "bbc-two",
    "cdxSlug": "bbctwo-uk",
    "name": "BBC Two",
    "title": "BBC Two",
    "image": "https://ichef.bbci.co.uk/images/ic/1200x675/p0bvs8dg.jpg",
    "flag": "gb",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/bbctwo-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/bbctwo-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "BBC Two (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/bbctwo-uk",
        "type": "0"
      },
      {
        "title": "BBC Two (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bbc-two/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bein_sports",
    "slug": "bein-sports",
    "cdxSlug": "beinsports-usa",
    "name": "beIN Sports",
    "title": "beIN Sports",
    "image": "https://assets-us-01.kc-usercontent.com/31dbcbc6-da4c-0033-328a-d7621d0fa726/1318873e-8501-4f79-bb69-182d741cf9ad/beIN%20SPORTS%20Portada.jpg?ver=03-06-2025?w=3840&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;q=75",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/beinsports-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/beinsports-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "beIN Sports (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/beinsports-usa",
        "type": "0"
      },
      {
        "title": "beIN Sports (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bein-sports/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bravo",
    "slug": "bravo",
    "cdxSlug": "bravo-usa",
    "name": "Bravo",
    "title": "Bravo",
    "image": "https://www.bravotv.com/sites/bravo/files/2024/05/bravo-logo-2jpg.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/bravo-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/bravo-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Bravo (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/bravo-usa",
        "type": "0"
      },
      {
        "title": "Bravo (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bravo/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_boomerang",
    "slug": "boomerang",
    "cdxSlug": "boomerang-usa",
    "name": "Boomerang",
    "title": "Boomerang",
    "image": "https://cdn.broadbandtvnews.com/wp-content/uploads/2024/08/05120702/Boomerang.jpg",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/boomerang-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/boomerang-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Boomerang (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/boomerang-usa",
        "type": "0"
      },
      {
        "title": "Boomerang (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/boomerang/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_sport_pl",
    "slug": "canal-sport-pl",
    "cdxSlug": "canalsport-pl",
    "name": "CANAL+ Sport PL",
    "title": "CANAL+ Sport PL",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canansport.png",
    "flag": "pl",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/canalsport-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalsport-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Sport PL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalsport-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Sport PL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-sport-pl/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_sport_2_pl",
    "slug": "canal-sport-2-pl",
    "cdxSlug": "canalsport2-pl",
    "name": "CANAL+ Sport 2 PL",
    "title": "CANAL+ Sport 2 PL",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canansport.png",
    "flag": "pl",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/canalsport2-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalsport2-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Sport 2 PL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalsport2-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Sport 2 PL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-sport-2-pl/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_sport_3_pl",
    "slug": "canal-sport-3-pl",
    "cdxSlug": "canalsport3-pl",
    "name": "CANAL+ Sport 3 PL",
    "title": "CANAL+ Sport 3 PL",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canansport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/canalsport3-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalsport3-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Sport 3 PL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalsport3-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Sport 3 PL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-sport-3-pl/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_sport_4_pl",
    "slug": "canal-sport-4-pl",
    "cdxSlug": "canalsport4-pl",
    "name": "CANAL+ Sport 4 PL",
    "title": "CANAL+ Sport 4 PL",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canansport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/canalsport4-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalsport4-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Sport 4 PL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalsport4-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Sport 4 PL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-sport-4-pl/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_sport_5_pl",
    "slug": "canal-sport-5-pl",
    "cdxSlug": "canalsport5-pl",
    "name": "CANAL+ Sport 5 PL",
    "title": "CANAL+ Sport 5 PL",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canansport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/canalsport5-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalsport5-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Sport 5 PL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalsport5-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Sport 5 PL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-sport-5-pl/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cartoon_network",
    "slug": "cartoon-network",
    "cdxSlug": "cartoonnetwork-usa",
    "name": "Cartoon Network",
    "title": "Cartoon Network",
    "image": "https://1000logos.net/wp-content/uploads/2016/10/Cartoon-Network-logo.jpg",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/cartoonnetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cartoonnetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Cartoon Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cartoonnetwork-usa",
        "type": "0"
      },
      {
        "title": "Cartoon Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cartoon-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cbeebies",
    "slug": "cbeebies",
    "cdxSlug": "cbeebies-uk",
    "name": "CBeebies",
    "title": "CBeebies",
    "image": "https://static.files.bbci.co.uk/core/website/assets/static/childrens-web/images/metadata/cbeebies-poster-1024x576.8eb27aa32e.png",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/cbeebies-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cbeebies-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CBeebies (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cbeebies-uk",
        "type": "0"
      },
      {
        "title": "CBeebies (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cbeebies/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cbs",
    "slug": "cbs",
    "cdxSlug": "cbs-usa",
    "name": "CBS",
    "title": "CBS",
    "image": "https://wwwimage-tve.cbsstatic.com/base/files/seo/cbs_seo_1200x627_1.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/cbs-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cbs-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CBS (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cbs-usa",
        "type": "0"
      },
      {
        "title": "CBS (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cbs/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cbs_sports_network",
    "slug": "cbs-sports-network",
    "cdxSlug": "cbssn-usa",
    "name": "CBS Sports Network",
    "title": "CBS Sports Network",
    "image": "https://www.paramountshop.com/cdn/shop/files/cbssportsnetwork-mobile-min.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/cbssn-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cbssn-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CBS Sports Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cbssn-usa",
        "type": "0"
      },
      {
        "title": "CBS Sports Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cbs-sports-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cnbc",
    "slug": "cnbc",
    "cdxSlug": "cnbc-usa",
    "name": "CNBC",
    "title": "CNBC",
    "image": "https://cdn.versantmedia.com/versantmedia/styles/newsroom/s3/2025-11/cnbc%281600x900%29.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/cnbc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cnbc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CNBC (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cnbc-usa",
        "type": "0"
      },
      {
        "title": "CNBC (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cnbc/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_comedy_central",
    "slug": "comedy-central",
    "cdxSlug": "comedycentral-usa",
    "name": "Comedy Central",
    "title": "Comedy Central",
    "image": "https://wwwimage-us.pplusstatic.com/base/files/seo/og-brand-comedy-central.jpg?format=webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/comedycentral-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/comedycentral-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Comedy Central (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/comedycentral-usa",
        "type": "0"
      },
      {
        "title": "Comedy Central (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/comedy-central/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_cw",
    "slug": "cw",
    "cdxSlug": "cw-usa",
    "name": "CW",
    "title": "CW",
    "image": "https://www.wavy.com/wp-content/uploads/sites/3/2024/08/cw-logo-white-on-blue-wavy-background.jpg?w=1280",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/cw-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/cw-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CW (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/cw-usa",
        "type": "0"
      },
      {
        "title": "CW (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/cw/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_1_germany",
    "slug": "dazn-1-germany",
    "cdxSlug": "dazn1-de",
    "name": "DAZN 1 Germany",
    "title": "DAZN 1 Germany",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=12dpnhddhmpm71228raanhyxs2_image-header_pDach_1723627450000&amp;amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/dazn1-de",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn1-de\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 1 Germany (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn1-de",
        "type": "0"
      },
      {
        "title": "DAZN 1 Germany (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-1-germany/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_2_germany",
    "slug": "dazn-2-germany",
    "cdxSlug": "dazn2-de",
    "name": "DAZN 2 Germany",
    "title": "DAZN 2 Germany",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=1ni1lpwjtnxmr1xklfoptrt2mz_image-header_pDach_1723628653000",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/dazn2-de",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn2-de\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 2 Germany (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn2-de",
        "type": "0"
      },
      {
        "title": "DAZN 2 Germany (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-2-germany/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_1_italia",
    "slug": "dazn-1-italia",
    "cdxSlug": "dazn1-it",
    "name": "DAZN 1 Italia",
    "title": "DAZN 1 Italia",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=pterrit4f2xu1pa2r6x87y5e9_image-header_pIt_1724315365000&amp;amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/dazn1-it",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn1-it\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 1 Italia (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn1-it",
        "type": "0"
      },
      {
        "title": "DAZN 1 Italia (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-1-italia/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_1_spain",
    "slug": "dazn-1-spain",
    "cdxSlug": "dazn1-es",
    "name": "DAZN 1 Spain",
    "title": "DAZN 1 Spain",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=hn9vkic8rbfi1ndrym8sw2qh7_image-header_pEs_1723035920000",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/dazn1-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn1-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 1 Spain (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn1-es",
        "type": "0"
      },
      {
        "title": "DAZN 1 Spain (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-1-spain/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_2_spain",
    "slug": "dazn-2-spain",
    "cdxSlug": "dazn2-es",
    "name": "DAZN 2 Spain",
    "title": "DAZN 2 Spain",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=2ouwtae8ad7l1fxviow9bowpk_image-header_pEs_1723118632000&amp;amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/dazn2-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn2-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 2 Spain (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn2-es",
        "type": "0"
      },
      {
        "title": "DAZN 2 Spain (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-2-spain/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_1_portugal",
    "slug": "dazn-1-portugal",
    "cdxSlug": "dazn1-pt",
    "name": "DAZN 1 Portugal",
    "title": "DAZN 1 Portugal",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=1o4eamzb4env61ddc8wv4ra06l_image-header_pRow_1720521601000&amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/dazn1-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn1-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 1 Portugal (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn1-pt",
        "type": "0"
      },
      {
        "title": "DAZN 1 Portugal (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-1-portugal/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_1_usa",
    "slug": "dazn-1-usa",
    "cdxSlug": "dazn1-usa",
    "name": "DAZN 1 USA",
    "title": "DAZN 1 USA",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=1owzb99m9mnzy15hjxolpukwul_image-header_pUs_1771501796000&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/dazn1-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/dazn1-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN 1 USA (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/dazn1-usa",
        "type": "0"
      },
      {
        "title": "DAZN 1 USA (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-1-usa/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_f1",
    "slug": "dazn-f1",
    "cdxSlug": "daznf1-es",
    "name": "DAZN F1",
    "title": "DAZN F1",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=14ln25pmjdv031ejxsmg8dczsu_image-header_pEs_1723117975000&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/daznf1-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/daznf1-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN F1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/daznf1-es",
        "type": "0"
      },
      {
        "title": "DAZN F1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-f1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_dazn_laliga",
    "slug": "dazn-laliga",
    "cdxSlug": "daznlaliga-es",
    "name": "DAZN LaLiga",
    "title": "DAZN LaLiga",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=1weziux6zy5mb16pev002ax1yu_image-header_pEs_1723118324000",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/daznlaliga-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/daznlaliga-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "DAZN LaLiga (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/daznlaliga-es",
        "type": "0"
      },
      {
        "title": "DAZN LaLiga (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/dazn-laliga/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_discovery_channel",
    "slug": "discovery-channel",
    "cdxSlug": "discovery-usa",
    "name": "Discovery Channel",
    "title": "Discovery Channel",
    "image": "https://i.ibb.co/k2rbB1jc/e35d6be84084fed1d756c39242f13163.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/discovery-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/discovery-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Discovery Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/discovery-usa",
        "type": "0"
      },
      {
        "title": "Discovery Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/discovery-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_discovery_family",
    "slug": "discovery-family",
    "cdxSlug": "discoveryfamily-usa",
    "name": "Discovery Family",
    "title": "Discovery Family",
    "image": "https://i.ibb.co/wFmT9Q5t/Discovery-Family-ID-Let-s-Go-Yellow.webp",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/discoveryfamily-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/discoveryfamily-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Discovery Family (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/discoveryfamily-usa",
        "type": "0"
      },
      {
        "title": "Discovery Family (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/discovery-family/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_discovery_turbo",
    "slug": "discovery-turbo",
    "cdxSlug": "discoveryturbo-usa",
    "name": "Discovery Turbo",
    "title": "Discovery Turbo",
    "image": "https://i.ibb.co/20MgSXjy/featured-Image-1767979538707.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/discoveryturbo-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/discoveryturbo-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Discovery Turbo (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/discoveryturbo-usa",
        "type": "0"
      },
      {
        "title": "Discovery Turbo (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/discovery-turbo/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_disney_channel",
    "slug": "disney-channel",
    "cdxSlug": "disneychannel-usa",
    "name": "Disney Channel",
    "title": "Disney Channel",
    "image": "https://vignette4.wikia.nocookie.net/logopedia/images/9/93/Disney_Channel_Original_2014.png/revision/latest?cb=20140705213010",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/disneychannel-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/disneychannel-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Disney Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/disneychannel-usa",
        "type": "0"
      },
      {
        "title": "Disney Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/disney-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_disney_junior",
    "slug": "disney-junior",
    "cdxSlug": "disneyjunior-usa",
    "name": "Disney Junior",
    "title": "Disney Junior",
    "image": "https://thewaltdisneycompany.com/app/uploads/2021/02/021221_Disney-Junior-10th-Anniversary-00.jpg",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/disneyjunior-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/disneyjunior-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Disney Junior (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/disneyjunior-usa",
        "type": "0"
      },
      {
        "title": "Disney Junior (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/disney-junior/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_disney_xd",
    "slug": "disney-xd",
    "cdxSlug": "disneyxd-usa",
    "name": "Disney XD",
    "title": "Disney XD",
    "image": "https://www.laughingplace.com/uploads/2015/10/d128457e3b3ab8c050f306aa8e23666b9b05d3cc.jpg",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/disneyxd-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/disneyxd-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Disney XD (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/disneyxd-usa",
        "type": "0"
      },
      {
        "title": "Disney XD (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/disney-xd/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_eleven_sports_1",
    "slug": "eleven-sports-1",
    "cdxSlug": "elevensports1-pl",
    "name": "Eleven Sports 1",
    "title": "Eleven Sports 1",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/100659.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/elevensports1-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/elevensports1-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Eleven Sports 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/elevensports1-pl",
        "type": "0"
      },
      {
        "title": "Eleven Sports 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/eleven-sports-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_eleven_sports_2",
    "slug": "eleven-sports-2",
    "cdxSlug": "elevensports2-pl",
    "name": "Eleven Sports 2",
    "title": "Eleven Sports 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/100659.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/elevensports2-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/elevensports2-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Eleven Sports 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/elevensports2-pl",
        "type": "0"
      },
      {
        "title": "Eleven Sports 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/eleven-sports-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_eleven_sports_3",
    "slug": "eleven-sports-3",
    "cdxSlug": "elevensports3-pl",
    "name": "Eleven Sports 3",
    "title": "Eleven Sports 3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/100659.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/elevensports3-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/elevensports3-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Eleven Sports 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/elevensports3-pl",
        "type": "0"
      },
      {
        "title": "Eleven Sports 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/eleven-sports-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_eleven_sports_4",
    "slug": "eleven-sports-4",
    "cdxSlug": "elevensports4-pl",
    "name": "Eleven Sports 4",
    "title": "Eleven Sports 4",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/100659.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/elevensports4-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/elevensports4-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Eleven Sports 4 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/elevensports4-pl",
        "type": "0"
      },
      {
        "title": "Eleven Sports 4 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/eleven-sports-4/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_espn",
    "slug": "espn",
    "cdxSlug": "espn-usa",
    "name": "ESPN",
    "title": "ESPN",
    "image": "https://a1.espncdn.com/combiner/i?img=%2Fi%2Fespn%2Fespn_logos%2Fespn_red.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 13,
    "embedUrl": "https://epiembeds.online/embed/espn-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/espn-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ESPN (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/espn-usa",
        "type": "0"
      },
      {
        "title": "ESPN (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/espn/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_espn_deportes",
    "slug": "espn-deportes",
    "cdxSlug": "espndeportes-usa",
    "name": "ESPN Deportes",
    "title": "ESPN Deportes",
    "image": "https://i.ibb.co/Y7zHmbbz/i.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/espndeportes-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/espndeportes-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ESPN Deportes (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/espndeportes-usa",
        "type": "0"
      },
      {
        "title": "ESPN Deportes (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/espn-deportes/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_espn2",
    "slug": "espn2",
    "cdxSlug": "espn2-usa",
    "name": "ESPN2",
    "title": "ESPN2",
    "image": "https://discgolf.ultiworld.com/wp-content/uploads/2020/10/ESPN2.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 9,
    "embedUrl": "https://epiembeds.online/embed/espn2-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/espn2-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ESPN2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/espn2-usa",
        "type": "0"
      },
      {
        "title": "ESPN2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/espn2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_espnews",
    "slug": "espnews",
    "cdxSlug": "espnews-usa",
    "name": "ESPNEWS",
    "title": "ESPNEWS",
    "image": "https://i.ibb.co/5h4LGFHq/image.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/espnews-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/espnews-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ESPNEWS (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/espnews-usa",
        "type": "0"
      },
      {
        "title": "ESPNEWS (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/espnews/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_espnu",
    "slug": "espnu",
    "cdxSlug": "espnu-usa",
    "name": "ESPNU",
    "title": "ESPNU",
    "image": "https://i.ibb.co/Lh5jHVDm/ESPNU-logo-1-jpg.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/espnu-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/espnu-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "ESPNU (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/espnu-usa",
        "type": "0"
      },
      {
        "title": "ESPNU (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/espnu/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_food_network",
    "slug": "food-network",
    "cdxSlug": "foodnetwork-usa",
    "name": "Food Network",
    "title": "Food Network",
    "image": "https://i.ibb.co/5WcnZbYf/food-network-jpg.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/foodnetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/foodnetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Food Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/foodnetwork-usa",
        "type": "0"
      },
      {
        "title": "Food Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/food-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox",
    "slug": "fox",
    "cdxSlug": "fox-usa",
    "name": "Fox",
    "title": "Fox",
    "image": "https://i.ibb.co/8JdwqP4/foxusa.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/fox-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-usa",
        "type": "0"
      },
      {
        "title": "Fox (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_deportes",
    "slug": "fox-deportes",
    "cdxSlug": "foxdeportes-usa",
    "name": "Fox Deportes",
    "title": "Fox Deportes",
    "image": "https://foxsports-wordpress-www-prsupports-prod.s3.amazonaws.com/uploads/sites/2/2016/12/LOGO-DEPORTES-1040x585.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/foxdeportes-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/foxdeportes-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Deportes (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/foxdeportes-usa",
        "type": "0"
      },
      {
        "title": "Fox Deportes (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-deportes/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_1",
    "slug": "fox-sports-1",
    "cdxSlug": "fox-sports-1",
    "name": "Fox Sports 1",
    "title": "Fox Sports 1",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/2015_Fox_Sports_1_logo.svg/1280px-2015_Fox_Sports_1_logo.svg.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-1",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-1\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-1",
        "type": "0"
      },
      {
        "title": "Fox Sports 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_2",
    "slug": "fox-sports-2",
    "cdxSlug": "fox-sports-2",
    "name": "Fox Sports 2",
    "title": "Fox Sports 2",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/FS2_logo_2015.svg/1280px-FS2_logo_2015.svg.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-2",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-2\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-2",
        "type": "0"
      },
      {
        "title": "Fox Sports 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_501_cricket",
    "slug": "fox-sports-501-cricket",
    "cdxSlug": "fox-sports-501",
    "name": "Fox Sports 501 (Cricket)",
    "title": "Fox Sports 501 (Cricket)",
    "image": "https://i.ibb.co/Y4bTS1p7/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-501",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-501\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 501 (Cricket) (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-501",
        "type": "0"
      },
      {
        "title": "Fox Sports 501 (Cricket) (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-501-cricket/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_502_league",
    "slug": "fox-sports-502-league",
    "cdxSlug": "fox-sports-502",
    "name": "Fox Sports 502 (League)",
    "title": "Fox Sports 502 (League)",
    "image": "https://i.ibb.co/tppZhDrb/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-502",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-502\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 502 (League) (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-502",
        "type": "0"
      },
      {
        "title": "Fox Sports 502 (League) (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-502-league/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_503",
    "slug": "fox-sports-503",
    "cdxSlug": "fox-sports-503",
    "name": "Fox Sports 503",
    "title": "Fox Sports 503",
    "image": "https://i.ibb.co/xS4MkGSL/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-503",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-503\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 503 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-503",
        "type": "0"
      },
      {
        "title": "Fox Sports 503 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-503/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_504_footy",
    "slug": "fox-sports-504-footy",
    "cdxSlug": "fox-sports-504",
    "name": "Fox Sports 504 (Footy)",
    "title": "Fox Sports 504 (Footy)",
    "image": "https://i.ibb.co/SXvQLc0M/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-504",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-504\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 504 (Footy) (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-504",
        "type": "0"
      },
      {
        "title": "Fox Sports 504 (Footy) (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-504-footy/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_505",
    "slug": "fox-sports-505",
    "cdxSlug": "fox-sports-505",
    "name": "Fox Sports 505",
    "title": "Fox Sports 505",
    "image": "https://i.ibb.co/prKZGNLt/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-505",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-505\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 505 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-505",
        "type": "0"
      },
      {
        "title": "Fox Sports 505 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-505/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_506",
    "slug": "fox-sports-506",
    "cdxSlug": "fox-sports-506",
    "name": "Fox Sports 506",
    "title": "Fox Sports 506",
    "image": "https://i.ibb.co/Swks4Lmj/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-506",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-506\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 506 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-506",
        "type": "0"
      },
      {
        "title": "Fox Sports 506 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-506/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_sports_507",
    "slug": "fox-sports-507",
    "cdxSlug": "fox-sports-507",
    "name": "Fox Sports 507",
    "title": "Fox Sports 507",
    "image": "https://i.ibb.co/7d6VgDVL/image.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/fox-sports-507",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fox-sports-507\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Sports 507 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fox-sports-507",
        "type": "0"
      },
      {
        "title": "Fox Sports 507 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-sports-507/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fx",
    "slug": "fx",
    "cdxSlug": "fx-usa",
    "name": "FX",
    "title": "FX",
    "image": "https://static0.srcdn.com/wordpress/wp-content/uploads/2026/01/gold-fx-channel-logo-1.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/fx-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fx-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "FX (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fx-usa",
        "type": "0"
      },
      {
        "title": "FX (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fx/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fxm",
    "slug": "fxm",
    "cdxSlug": "fxm-usa",
    "name": "FXM",
    "title": "FXM",
    "image": "https://www.awn.com/sites/default/files/styles/original/public/image/featured/50716-buster-creates-brand-id-new-fxm-programming-block_0.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/fxm-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fxm-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "FXM (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fxm-usa",
        "type": "0"
      },
      {
        "title": "FXM (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fxm/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fxx",
    "slug": "fxx",
    "cdxSlug": "fxx-usa",
    "name": "FXX",
    "title": "FXX",
    "image": "https://thestreamable.com/media/pages/channels/fxx/b6fc72ce3d-1756344305/fxx-banner-1536x864-crop.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/fxx-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/fxx-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "FXX (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/fxx-usa",
        "type": "0"
      },
      {
        "title": "FXX (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fxx/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_freeform",
    "slug": "freeform",
    "cdxSlug": "freeform-usa",
    "name": "Freeform",
    "title": "Freeform",
    "image": "https://d2z00kf51ll94q.cloudfront.net//archive/2023/large/ADC102_BCD021B_0.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/freeform-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/freeform-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Freeform (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/freeform-usa",
        "type": "0"
      },
      {
        "title": "Freeform (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/freeform/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_go3_sport_1",
    "slug": "go3-sport-1",
    "cdxSlug": "go3sport1-lt",
    "name": "Go3 Sport 1",
    "title": "Go3 Sport 1",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/go3sport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/go3sport1-lt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/go3sport1-lt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Go3 Sport 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/go3sport1-lt",
        "type": "0"
      },
      {
        "title": "Go3 Sport 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/go3-sport-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_go3_sport_2",
    "slug": "go3-sport-2",
    "cdxSlug": "go3sport2-lt",
    "name": "Go3 Sport 2",
    "title": "Go3 Sport 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/go3sport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/go3sport2-lt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/go3sport2-lt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Go3 Sport 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/go3sport2-lt",
        "type": "0"
      },
      {
        "title": "Go3 Sport 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/go3-sport-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_go3_sport_3",
    "slug": "go3-sport-3",
    "cdxSlug": "go3sport2-lt",
    "name": "Go3 Sport 3",
    "title": "Go3 Sport 3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/go3sport.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/go3sport2-lt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/go3sport2-lt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Go3 Sport 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/go3sport2-lt",
        "type": "0"
      },
      {
        "title": "Go3 Sport 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/go3-sport-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_golf_channel",
    "slug": "golf-channel",
    "cdxSlug": "golfchannel-usa",
    "name": "GOLF Channel",
    "title": "GOLF Channel",
    "image": "https://corporate.comcast.com/media/img/1000w/2020/01/corporate_golf-channel-16x9-social.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/golfchannel-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/golfchannel-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "GOLF Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/golfchannel-usa",
        "type": "0"
      },
      {
        "title": "GOLF Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/golf-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hbo",
    "slug": "hbo",
    "cdxSlug": "hbo-usa",
    "name": "HBO",
    "title": "HBO",
    "image": "https://static.hbo.com/2021-11/hbo-static-1920.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/hbo-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hbo-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HBO (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hbo-usa",
        "type": "0"
      },
      {
        "title": "HBO (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hbo/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hbo_comedy",
    "slug": "hbo-comedy",
    "cdxSlug": "hbocomedy-usa",
    "name": "HBO Comedy",
    "title": "HBO Comedy",
    "image": "https://www.tvinsider.com/wp-content/uploads/2022/03/hbo-comedy.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/hbocomedy-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hbocomedy-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HBO Comedy (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hbocomedy-usa",
        "type": "0"
      },
      {
        "title": "HBO Comedy (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hbo-comedy/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hbo_drama",
    "slug": "hbo-drama",
    "cdxSlug": "hbodrama-usa",
    "name": "HBO Drama",
    "title": "HBO Drama",
    "image": "https://i.ibb.co/Qv2Mz3ZB/https-archive-images-prod-global-a201836-reutersmedia-net-2016-10-30-LYNXMPEC9-T08-O.avif",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/hbodrama-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hbodrama-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HBO Drama (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hbodrama-usa",
        "type": "0"
      },
      {
        "title": "HBO Drama (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hbo-drama/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hbo_latino",
    "slug": "hbo-latino",
    "cdxSlug": "hbolatino-usa",
    "name": "HBO Latino",
    "title": "HBO Latino",
    "image": "https://i.ibb.co/TMzmbVYq/maxresdefault.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/hbolatino-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hbolatino-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HBO Latino (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hbolatino-usa",
        "type": "0"
      },
      {
        "title": "HBO Latino (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hbo-latino/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hbo_movies",
    "slug": "hbo-movies",
    "cdxSlug": "hbomovies-usa",
    "name": "HBO Movies",
    "title": "HBO Movies",
    "image": "https://i.ibb.co/Qv2Mz3ZB/https-archive-images-prod-global-a201836-reutersmedia-net-2016-10-30-LYNXMPEC9-T08-O.avif",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/hbomovies-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hbomovies-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HBO Movies (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hbomovies-usa",
        "type": "0"
      },
      {
        "title": "HBO Movies (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hbo-movies/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_hgtv",
    "slug": "hgtv",
    "cdxSlug": "hgtv-usa",
    "name": "HGTV",
    "title": "HGTV",
    "image": "https://i.ibb.co/gbtDnLhS/hgtv-jpg.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/hgtv-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/hgtv-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "HGTV (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/hgtv-usa",
        "type": "0"
      },
      {
        "title": "HGTV (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/hgtv/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_mlb_network",
    "slug": "mlb-network",
    "cdxSlug": "mlbnetwork-usa",
    "name": "MLB Network",
    "title": "MLB Network",
    "image": "https://img.mlbstatic.com/mlb-images/image/private/t_16x9/t_w2208/mlb/xtkynqe5wgtzaddnsus2.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/mlbnetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/mlbnetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "MLB Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/mlbnetwork-usa",
        "type": "0"
      },
      {
        "title": "MLB Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/mlb-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_motogp_channel",
    "slug": "motogp-channel",
    "cdxSlug": "motpgp-tv",
    "name": "MotoGP Channel",
    "title": "MotoGP Channel",
    "image": "https://sportbikesincmag.com/wp-content/uploads/2024/11/New-MotoGP-Logo-sportbikesincmag.com-4.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/motpgp-tv",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/motpgp-tv\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "MotoGP Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/motpgp-tv",
        "type": "0"
      },
      {
        "title": "MotoGP Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/motogp-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_mtv",
    "slug": "mtv",
    "cdxSlug": "mtv-usa",
    "name": "MTV",
    "title": "MTV",
    "image": "https://static0.colliderimages.com/wordpress/wp-content/uploads/2025/12/mtv-logo-1.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/mtv-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/mtv-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "MTV (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/mtv-usa",
        "type": "0"
      },
      {
        "title": "MTV (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/mtv/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nba_tv",
    "slug": "nba-tv",
    "cdxSlug": "nbatv-usa",
    "name": "NBA TV",
    "title": "NBA TV",
    "image": "https://static.cdn.turner.com/styles/header_image_1500x500_cropped/s3/nba-tv-16x9-1.jpg?itok=6H8mrlyR",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/nbatv-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nbatv-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NBA TV (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nbatv-usa",
        "type": "0"
      },
      {
        "title": "NBA TV (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nba-tv/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nbc",
    "slug": "nbc",
    "cdxSlug": "nbc-usa",
    "name": "NBC",
    "title": "NBC",
    "image": "https://cdn.mos.cms.futurecdn.net/zP42nmS7MRj2kvBqNEs8CE.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/nbc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nbc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NBC (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nbc-usa",
        "type": "0"
      },
      {
        "title": "NBC (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nbc/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nbc_sports_bay_area",
    "slug": "nbc-sports-bay-area",
    "cdxSlug": "nbc-sports-bayarea",
    "name": "NBC Sports Bay Area",
    "title": "NBC Sports Bay Area",
    "image": "https://cdn.mos.cms.futurecdn.net/d7jWexxhtezRZ6ryLHyKmd.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/nbc-sports-bayarea",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nbc-sports-bayarea\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NBC Sports Bay Area (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nbc-sports-bayarea",
        "type": "0"
      },
      {
        "title": "NBC Sports Bay Area (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nbc-sports-bay-area/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nbc_sports_philadelphia",
    "slug": "nbc-sports-philadelphia",
    "cdxSlug": "nbc-sports-philly",
    "name": "NBC Sports Philadelphia",
    "title": "NBC Sports Philadelphia",
    "image": "https://media.nbcsportsphiladelphia.com/2023/04/Philly-Landmark.png?resize=1200%2C675&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;quality=85&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;strip=all",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/nbc-sports-philly",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nbc-sports-philly\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NBC Sports Philadelphia (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nbc-sports-philly",
        "type": "0"
      },
      {
        "title": "NBC Sports Philadelphia (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nbc-sports-philadelphia/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nfl_network",
    "slug": "nfl-network",
    "cdxSlug": "nflnetwork-usa",
    "name": "NFL Network",
    "title": "NFL Network",
    "image": "https://i.ibb.co/ZRsTndvV/tfki7njrm3y8jycbtkrx.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/nflnetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nflnetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NFL Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nflnetwork-usa",
        "type": "0"
      },
      {
        "title": "NFL Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nfl-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nhl_network",
    "slug": "nhl-network",
    "cdxSlug": "nhlnetwork-usa",
    "name": "NHL Network",
    "title": "NHL Network",
    "image": "https://media.d3.nhle.com/image/private/t_ratio16_9-size50/prd/lhum6z3hyaga9ahnjow0.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/nhlnetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nhlnetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "NHL Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nhlnetwork-usa",
        "type": "0"
      },
      {
        "title": "NHL Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nhl-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nick_jr",
    "slug": "nick-jr",
    "cdxSlug": "nickjr-usa",
    "name": "Nick Jr.",
    "title": "Nick Jr.",
    "image": "https://i.ibb.co/xS6CMxZD/nick-jr-logo-2023-4.jpg",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/nickjr-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nickjr-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Nick Jr. (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nickjr-usa",
        "type": "0"
      },
      {
        "title": "Nick Jr. (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nick-jr/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nickelodeon",
    "slug": "nickelodeon",
    "cdxSlug": "nickelodeon-usa",
    "name": "Nickelodeon",
    "title": "Nickelodeon",
    "image": "https://i.ibb.co/xSM8bDYh/roger-nickelodeon-graphic-design-format-webp-width-2880-8-Yj-L2u3-KSI20j-HDQ.webp",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/nickelodeon-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nickelodeon-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Nickelodeon (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nickelodeon-usa",
        "type": "0"
      },
      {
        "title": "Nickelodeon (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nickelodeon/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_nicktoons",
    "slug": "nicktoons",
    "cdxSlug": "nicktoons-usa",
    "name": "Nicktoons",
    "title": "Nicktoons",
    "image": "https://i.ibb.co/XfX32tyx/nicktoons-logo-2023-rebrand-2.png",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/nicktoons-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/nicktoons-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Nicktoons (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/nicktoons-usa",
        "type": "0"
      },
      {
        "title": "Nicktoons (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/nicktoons/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_polsat_sport_1",
    "slug": "polsat-sport-1",
    "cdxSlug": "polsatsport1-pl",
    "name": "Polsat Sport 1",
    "title": "Polsat Sport 1",
    "image": "https://staticeu.sweet.tv/images/cache/v2/channel_banner/COEd/3809-polsat-sport-1-hd.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/polsatsport1-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/polsatsport1-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Polsat Sport 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/polsatsport1-pl",
        "type": "0"
      },
      {
        "title": "Polsat Sport 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/polsat-sport-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_polsat_sport_2",
    "slug": "polsat-sport-2",
    "cdxSlug": "polsatsport2-pl",
    "name": "Polsat Sport 2",
    "title": "Polsat Sport 2",
    "image": "https://staticeu.sweet.tv/images/cache/v2/channel_banner/COId/3810-polsat-sport-2-hd.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/polsatsport2-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/polsatsport2-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Polsat Sport 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/polsatsport2-pl",
        "type": "0"
      },
      {
        "title": "Polsat Sport 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/polsat-sport-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_polsat_sport_3",
    "slug": "polsat-sport-3",
    "cdxSlug": "polsatsport3-pl",
    "name": "Polsat Sport 3",
    "title": "Polsat Sport 3",
    "image": "https://staticeu.sweet.tv/images/cache/v2/channel_banner/COMd/3811-polsat-sport-3-hd.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/polsatsport3-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/polsatsport3-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Polsat Sport 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/polsatsport3-pl",
        "type": "0"
      },
      {
        "title": "Polsat Sport 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/polsat-sport-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_polsat_sport_fight",
    "slug": "polsat-sport-fight",
    "cdxSlug": "polsatsportfight-pl",
    "name": "Polsat Sport Fight",
    "title": "Polsat Sport Fight",
    "image": "https://staticeu.sweet.tv/images/cache/v2/channel_banner/COUd/3813-polsat-sport-fight-hd.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/polsatsportfight-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/polsatsportfight-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Polsat Sport Fight (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/polsatsportfight-pl",
        "type": "0"
      },
      {
        "title": "Polsat Sport Fight (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/polsat-sport-fight/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_premier_sports_1_ie",
    "slug": "premier-sports-1-ie",
    "cdxSlug": "https://epiembeds.online/embed/premiersports1-ie",
    "name": "Premier Sports 1 IE",
    "title": "Premier Sports 1 IE",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/premiersports.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/premiersports1-ie",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/premiersports1-ie\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Premier Sports 1 IE (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/premiersports1-ie",
        "type": "0"
      },
      {
        "title": "Premier Sports 1 IE (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/premier-sports-1-ie/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_premier_sports_2_ie",
    "slug": "premier-sports-2-ie",
    "cdxSlug": "https://epiembeds.online/embed/premiersports2-ie",
    "name": "Premier Sports 2 IE",
    "title": "Premier Sports 2 IE",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/premiersports.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/premiersports2-ie",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/premiersports2-ie\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Premier Sports 2 IE (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/premiersports2-ie",
        "type": "0"
      },
      {
        "title": "Premier Sports 2 IE (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/premier-sports-2-ie/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_premiere",
    "slug": "premiere",
    "cdxSlug": "premiere-br",
    "name": "Premiere",
    "title": "Premiere",
    "image": "https://s3.glbimg.com/v1/AUTH_36abb2af534644878388f516c38b89ac/prod/home-share-1b75cdaa.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/premiere-br",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/premiere-br\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Premiere (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/premiere-br",
        "type": "0"
      },
      {
        "title": "Premiere (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/premiere/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_racer_network",
    "slug": "racer-network",
    "cdxSlug": "racernetwork-usa",
    "name": "RACER Network",
    "title": "RACER Network",
    "image": "https://cdn-cs-images.racer.com/v3/assets/blte77f57883ea46be1/bltb30b537c79808b35/680f2c517c8c98109d720e49/Racer_Network_1920x1080_Presser_V1.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/racernetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/racernetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "RACER Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/racernetwork-usa",
        "type": "0"
      },
      {
        "title": "RACER Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/racer-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime",
    "slug": "showtime",
    "cdxSlug": "showtime-usa",
    "name": "Showtime",
    "title": "Showtime",
    "image": "https://i.ibb.co/v7vcNY4/Showtime-Logo.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/showtime-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtime-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtime-usa",
        "type": "0"
      },
      {
        "title": "Showtime (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime_2",
    "slug": "showtime-2",
    "cdxSlug": "showtime2-usa",
    "name": "Showtime 2",
    "title": "Showtime 2",
    "image": "https://i.ibb.co/8gCRbv0s/Showtime-2-svg.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/showtime2-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtime2-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtime2-usa",
        "type": "0"
      },
      {
        "title": "Showtime 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime_extreme",
    "slug": "showtime-extreme",
    "cdxSlug": "showtimeextreme-usa",
    "name": "Showtime Extreme",
    "title": "Showtime Extreme",
    "image": "https://i.ibb.co/1t5fNwpQ/Showtime-Closing-2013.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/showtimeextreme-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtimeextreme-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime Extreme (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtimeextreme-usa",
        "type": "0"
      },
      {
        "title": "Showtime Extreme (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime-extreme/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime_family_zone",
    "slug": "showtime-family-zone",
    "cdxSlug": "showtimefamilyzone-usa",
    "name": "Showtime Family Zone",
    "title": "Showtime Family Zone",
    "image": "https://i.ibb.co/1t5fNwpQ/Showtime-Closing-2013.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/showtimefamilyzone-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtimefamilyzone-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime Family Zone (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtimefamilyzone-usa",
        "type": "0"
      },
      {
        "title": "Showtime Family Zone (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime-family-zone/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime_next",
    "slug": "showtime-next",
    "cdxSlug": "showtimenext-usa",
    "name": "Showtime Next",
    "title": "Showtime Next",
    "image": "https://i.ibb.co/1t5fNwpQ/Showtime-Closing-2013.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/showtimenext-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtimenext-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime Next (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtimenext-usa",
        "type": "0"
      },
      {
        "title": "Showtime Next (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime-next/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_showtime_women",
    "slug": "showtime-women",
    "cdxSlug": "showtimewomen-usa",
    "name": "Showtime Women",
    "title": "Showtime Women",
    "image": "https://i.ibb.co/1t5fNwpQ/Showtime-Closing-2013.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/showtimewomen-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/showtimewomen-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Showtime Women (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/showtimewomen-usa",
        "type": "0"
      },
      {
        "title": "Showtime Women (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/showtime-women/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_1_nz",
    "slug": "sky-sport-1-nz",
    "cdxSlug": "skysport1-nz",
    "name": "Sky Sport 1 NZ",
    "title": "Sky Sport 1 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/skysport1-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport1-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 1 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport1-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 1 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-1-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_2_nz",
    "slug": "sky-sport-2-nz",
    "cdxSlug": "skysport2-nz",
    "name": "Sky Sport 2 NZ",
    "title": "Sky Sport 2 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysport2-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport2-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 2 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport2-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 2 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-2-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_3_nz",
    "slug": "sky-sport-3-nz",
    "cdxSlug": "skysport3-nz",
    "name": "Sky Sport 3 NZ",
    "title": "Sky Sport 3 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/skysport3-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport3-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 3 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport3-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 3 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-3-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_4_nz",
    "slug": "sky-sport-4-nz",
    "cdxSlug": "skysport4-nz",
    "name": "Sky Sport 4 NZ",
    "title": "Sky Sport 4 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/skysport4-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport4-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 4 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport4-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 4 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-4-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_5_nz",
    "slug": "sky-sport-5-nz",
    "cdxSlug": "skysport5-nz",
    "name": "Sky Sport 5 NZ",
    "title": "Sky Sport 5 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/skysport5-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport5-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 5 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport5-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 5 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-5-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_6_nz",
    "slug": "sky-sport-6-nz",
    "cdxSlug": "skysport6-nz",
    "name": "Sky Sport 6 NZ",
    "title": "Sky Sport 6 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysport6-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport6-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 6 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport6-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 6 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-6-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_7_nz",
    "slug": "sky-sport-7-nz",
    "cdxSlug": "skysport7-nz",
    "name": "Sky Sport 7 NZ",
    "title": "Sky Sport 7 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysport7-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport7-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 7 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport7-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 7 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-7-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_8_nz",
    "slug": "sky-sport-8-nz",
    "cdxSlug": "skysport8-nz",
    "name": "Sky Sport 8 NZ",
    "title": "Sky Sport 8 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysport8-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport8-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 8 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport8-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 8 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-8-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_9_nz",
    "slug": "sky-sport-9-nz",
    "cdxSlug": "skysport9-nz",
    "name": "Sky Sport 9 NZ",
    "title": "Sky Sport 9 NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysport9-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysport9-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport 9 NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysport9-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport 9 NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-9-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sport_select_nz",
    "slug": "sky-sport-select-nz",
    "cdxSlug": "skysportselect-nz",
    "name": "Sky Sport Select NZ",
    "title": "Sky Sport Select NZ",
    "image": "https://i.ibb.co/v4NvkZst/Untitled-design.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysportselect-nz",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportselect-nz\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sport Select NZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportselect-nz",
        "type": "0"
      },
      {
        "title": "Sky Sport Select NZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sport-select-nz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_plus",
    "slug": "sky-sports-plus",
    "cdxSlug": "skysportsplus-uk",
    "name": "Sky Sports+",
    "title": "Sky Sports+",
    "image": "https://e0.365dm.com/24/07/2048x1152/skysports-ssplus-sky-sports-plus_6644064.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysportsplus-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsplus-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports+ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsplus-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports+ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-plus/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_action",
    "slug": "sky-sports-action",
    "cdxSlug": "skysportsaction-uk",
    "name": "Sky Sports Action",
    "title": "Sky Sports Action",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/skysportsaction.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/skysportsaction-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsaction-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Action (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsaction-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Action (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-action/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_cricket",
    "slug": "sky-sports-cricket",
    "cdxSlug": "skysportscricket-uk",
    "name": "Sky Sports Cricket",
    "title": "Sky Sports Cricket",
    "image": "https://e0.365dm.com/17/07/2048x1152/skysports-sky-sports-cricket-podcast-sky-cricket-podcast_4004801.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/skysportscricket-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportscricket-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Cricket (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportscricket-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Cricket (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-cricket/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_f1",
    "slug": "sky-sports-f1",
    "cdxSlug": "skysportsf1-uk",
    "name": "Sky Sports F1",
    "title": "Sky Sports F1",
    "image": "https://e0.365dm.com/21/03/1600x900/skysports-f1-2021-graphic_5299452.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/skysportsf1-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsf1-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports F1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsf1-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports F1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-f1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_football",
    "slug": "sky-sports-football",
    "cdxSlug": "skysportsfootball-uk",
    "name": "Sky Sports Football",
    "title": "Sky Sports Football",
    "image": "https://images.squarespace-cdn.com/content/v1/6380a5b12f7b6f632e16ce77/46d62da8-e650-4d2b-a5bc-48a5648edb8e/Beth_Mead.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/skysportsfootball-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsfootball-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Football (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsfootball-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Football (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-football/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_golf",
    "slug": "sky-sports-golf",
    "cdxSlug": "skysportsgolf-uk",
    "name": "Sky Sports Golf",
    "title": "Sky Sports Golf",
    "image": "https://e0.365dm.com/23/05/1600x900/skysports-golf-sky-sports-golf_6158933.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/skysportsgolf-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsgolf-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Golf (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsgolf-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Golf (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-golf/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_main_event",
    "slug": "sky-sports-main-event",
    "cdxSlug": "skysportsmainevent-uk",
    "name": "Sky Sports Main Event",
    "title": "Sky Sports Main Event",
    "image": "https://e0.365dm.com/17/07/1600x900/skysports-all-new-rebrand-f1-premier-league-golf-cricket_4001810.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysportsmainevent-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsmainevent-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Main Event (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsmainevent-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Main Event (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-main-event/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_mix",
    "slug": "sky-sports-mix",
    "cdxSlug": "skysportsmix-uk",
    "name": "Sky Sports Mix",
    "title": "Sky Sports Mix",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/Sky_Sports_Mix_Generic_ID_2017.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysportsmix-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsmix-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Mix (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsmix-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Mix (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-mix/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_news",
    "slug": "sky-sports-news",
    "cdxSlug": "skysportsnews-uk",
    "name": "Sky Sports News",
    "title": "Sky Sports News",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/image.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/skysportsnews-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsnews-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports News (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsnews-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports News (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-news/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_premier_league",
    "slug": "sky-sports-premier-league",
    "cdxSlug": "skysportspremierleague-uk",
    "name": "Sky Sports Premier League",
    "title": "Sky Sports Premier League",
    "image": "https://e0.365dm.com/25/06/2048x1152/skysports-premier-league-fixtures_6937276.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/skysportspremierleague-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportspremierleague-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Premier League (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportspremierleague-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Premier League (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-premier-league/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_racing",
    "slug": "sky-sports-racing",
    "cdxSlug": "skysportsracing-uk",
    "name": "Sky Sports Racing",
    "title": "Sky Sports Racing",
    "image": "https://e0.365dm.com/23/07/2048x1152/skysports-racing-league-sky-sports-racing_6230990.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/skysportsracing-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportsracing-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Racing (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportsracing-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Racing (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-racing/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sky_sports_tennis",
    "slug": "sky-sports-tennis",
    "cdxSlug": "skysportstennis-uk",
    "name": "Sky Sports Tennis",
    "title": "Sky Sports Tennis",
    "image": "https://e0.365dm.com/24/01/2048x1152/skysports-sky-sports-tennis_6437709.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 5,
    "embedUrl": "https://epiembeds.online/embed/skysportstennis-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/skysportstennis-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sky Sports Tennis (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/skysportstennis-uk",
        "type": "0"
      },
      {
        "title": "Sky Sports Tennis (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sky-sports-tennis/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sony_sports_network",
    "slug": "sony-sports-network",
    "cdxSlug": "sonysportsnetwork-in",
    "name": "Sony Sports Network",
    "title": "Sony Sports Network",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/085457534.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/sonysportsnetwork-in",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sonysportsnetwork-in\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sony Sports Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sonysportsnetwork-in",
        "type": "0"
      },
      {
        "title": "Sony Sports Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sony-sports-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sony_sports_network_2",
    "slug": "sony-sports-network-2",
    "cdxSlug": "sonysportsnetwork2-in",
    "name": "Sony Sports Network 2",
    "title": "Sony Sports Network 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/085457534.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/sonysportsnetwork2-in",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sonysportsnetwork2-in\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sony Sports Network 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sonysportsnetwork2-in",
        "type": "0"
      },
      {
        "title": "Sony Sports Network 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sony-sports-network-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sony_sports_network_3",
    "slug": "sony-sports-network-3",
    "cdxSlug": "sonysportsnetwork3-in",
    "name": "Sony Sports Network 3",
    "title": "Sony Sports Network 3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/085457534.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/sonysportsnetwork3-in",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sonysportsnetwork3-in\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sony Sports Network 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sonysportsnetwork3-in",
        "type": "0"
      },
      {
        "title": "Sony Sports Network 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sony-sports-network-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sony_sports_network_4",
    "slug": "sony-sports-network-4",
    "cdxSlug": "sonysportsnetwork4-in",
    "name": "Sony Sports Network 4",
    "title": "Sony Sports Network 4",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/085457534.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/sonysportsnetwork4-in",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sonysportsnetwork4-in\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sony Sports Network 4 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sonysportsnetwork4-in",
        "type": "0"
      },
      {
        "title": "Sony Sports Network 4 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sony-sports-network-4/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sony_sports_network_5",
    "slug": "sony-sports-network-5",
    "cdxSlug": "sonysportsnetwork5-in",
    "name": "Sony Sports Network 5",
    "title": "Sony Sports Network 5",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/085457534.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/sonysportsnetwork5-in",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sonysportsnetwork5-in\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sony Sports Network 5 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sonysportsnetwork5-in",
        "type": "0"
      },
      {
        "title": "Sony Sports Network 5 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sony-sports-network-5/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sport_tv1",
    "slug": "sport-tv1",
    "cdxSlug": "https://epiembeds.online/play/sporttv1-pt",
    "name": "Sport TV1",
    "title": "Sport TV1",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/sportv-pt.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/sporttv1-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sporttv1-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sport TV1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sporttv1-pt",
        "type": "0"
      },
      {
        "title": "Sport TV1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sport-tv1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sport_tv2",
    "slug": "sport-tv2",
    "cdxSlug": "sporttv2-pt",
    "name": "Sport TV2",
    "title": "Sport TV2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/sportv-pt.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/sporttv2-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sporttv2-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sport TV2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sporttv2-pt",
        "type": "0"
      },
      {
        "title": "Sport TV2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sport-tv2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sport_tv3",
    "slug": "sport-tv3",
    "cdxSlug": "sporttv3-pt",
    "name": "Sport TV3",
    "title": "Sport TV3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/sportv-pt.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/sporttv3-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sporttv3-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sport TV3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sporttv3-pt",
        "type": "0"
      },
      {
        "title": "Sport TV3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sport-tv3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sport_tv4",
    "slug": "sport-tv4",
    "cdxSlug": "sporttv4-pt",
    "name": "Sport TV4",
    "title": "Sport TV4",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/sportv-pt.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/sporttv4-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sporttv4-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sport TV4 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sporttv4-pt",
        "type": "0"
      },
      {
        "title": "Sport TV4 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sport-tv4/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sport_tv5",
    "slug": "sport-tv5",
    "cdxSlug": "sporttv5-pt",
    "name": "Sport TV5",
    "title": "Sport TV5",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/sportv-pt.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/sporttv5-pt",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sporttv5-pt\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Sport TV5 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sporttv5-pt",
        "type": "0"
      },
      {
        "title": "Sport TV5 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sport-tv5/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_starz",
    "slug": "starz",
    "cdxSlug": "starz-usa",
    "name": "STARZ",
    "title": "STARZ",
    "image": "https://careers.starz.com/wp-content/uploads/2025/01/STARZ-LOGO-IMAGE.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/starz-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/starz-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "STARZ (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/starz-usa",
        "type": "0"
      },
      {
        "title": "STARZ (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/starz/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_starz_cinema",
    "slug": "starz-cinema",
    "cdxSlug": "starzcinema-usa",
    "name": "STARZ Cinema",
    "title": "STARZ Cinema",
    "image": "https://careers.starz.com/wp-content/uploads/2025/01/STARZ-LOGO-IMAGE.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/starzcinema-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/starzcinema-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "STARZ Cinema (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/starzcinema-usa",
        "type": "0"
      },
      {
        "title": "STARZ Cinema (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/starz-cinema/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_starz_comedy",
    "slug": "starz-comedy",
    "cdxSlug": "starzcomedy-usa",
    "name": "STARZ Comedy",
    "title": "STARZ Comedy",
    "image": "https://careers.starz.com/wp-content/uploads/2025/01/STARZ-LOGO-IMAGE.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/starzcomedy-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/starzcomedy-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "STARZ Comedy (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/starzcomedy-usa",
        "type": "0"
      },
      {
        "title": "STARZ Comedy (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/starz-comedy/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_starz_kids_and_family",
    "slug": "starz-kids-and-family",
    "cdxSlug": "starzkidsfamily-usa",
    "name": "STARZ Kids and Family",
    "title": "STARZ Kids and Family",
    "image": "https://careers.starz.com/wp-content/uploads/2025/01/STARZ-LOGO-IMAGE.png",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/starzkidsfamily-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/starzkidsfamily-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "STARZ Kids and Family (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/starzkidsfamily-usa",
        "type": "0"
      },
      {
        "title": "STARZ Kids and Family (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/starz-kids-and-family/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_syfy",
    "slug": "syfy",
    "cdxSlug": "syfy-usa",
    "name": "SYFY",
    "title": "SYFY",
    "image": "https://assets.goal.com/images/v3/blt1be56273baf0440d/syfy%20logo.jpg?auto=webp&amp;amp;amp;amp;amp;amp;format=pjpg&amp;amp;amp;amp;amp;amp;width=3840&amp;amp;amp;amp;amp;amp;quality=60",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/syfy-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/syfy-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "SYFY (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/syfy-usa",
        "type": "0"
      },
      {
        "title": "SYFY (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/syfy/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tbs",
    "slug": "tbs",
    "cdxSlug": "tbs-usa",
    "name": "TBS",
    "title": "TBS",
    "image": "https://cdn.sanity.io/images/1pn9obcz/production/a6971fbe09c85f2deeb480fc494a39219d039135-1920x1080.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/tbs-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tbs-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TBS (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tbs-usa",
        "type": "0"
      },
      {
        "title": "TBS (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tbs/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_teenick",
    "slug": "teenick",
    "cdxSlug": "teenick-usa",
    "name": "Teenick",
    "title": "Teenick",
    "image": "https://i.ibb.co/3yCJDVrW/Teen-Nick-2023.webp",
    "flag": "us",
    "category": "Cartoons",
    "genre": "Cartoons",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/teenick-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/teenick-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Teenick (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/teenick-usa",
        "type": "0"
      },
      {
        "title": "Teenick (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/teenick/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_telemundo",
    "slug": "telemundo",
    "cdxSlug": "telemundo-usa",
    "name": "Telemundo",
    "title": "Telemundo",
    "image": "https://media-cldnry.s-nbcnews.com/image/upload/newscms/2020_20/3352176/telemundo-social-default.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/telemundo-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/telemundo-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Telemundo (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/telemundo-usa",
        "type": "0"
      },
      {
        "title": "Telemundo (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/telemundo/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tennis_channel",
    "slug": "tennis-channel",
    "cdxSlug": "tennischannel-usa",
    "name": "Tennis Channel",
    "title": "Tennis Channel",
    "image": "https://s10019.cdn.ncms.io/wp-content/uploads/2026/05/tenn2.jpg.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/tennischannel-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tennischannel-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Tennis Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tennischannel-usa",
        "type": "0"
      },
      {
        "title": "Tennis Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tennis-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_the_weather_channel",
    "slug": "the-weather-channel",
    "cdxSlug": "twc-usa",
    "name": "The Weather Channel",
    "title": "The Weather Channel",
    "image": "https://i.ibb.co/bRJqL6WK/LWRBPBUMCVFA3-G5-Q4-ZH3-XJYDNY.avif",
    "flag": "us",
    "category": "News",
    "genre": "News",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/twc-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/twc-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "The Weather Channel (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/twc-usa",
        "type": "0"
      },
      {
        "title": "The Weather Channel (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/the-weather-channel/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tnt",
    "slug": "tnt",
    "cdxSlug": "tnt-usa",
    "name": "TNT",
    "title": "TNT",
    "image": "https://i.ytimg.com/vi/F-AHKcxi3pY/maxresdefault.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/tnt-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tnt-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TNT (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tnt-usa",
        "type": "0"
      },
      {
        "title": "TNT (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tnt/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tnt_sports_1",
    "slug": "tnt-sports-1",
    "cdxSlug": "btsports1-uk",
    "name": "TNT Sports 1",
    "title": "TNT Sports 1",
    "image": "https://cdn.mos.cms.futurecdn.net/y3oPitXYAwGJnyTHFYo5qB.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/btsports1-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/btsports1-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TNT Sports 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/btsports1-uk",
        "type": "0"
      },
      {
        "title": "TNT Sports 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tnt-sports-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tnt_sports_2",
    "slug": "tnt-sports-2",
    "cdxSlug": "tntsports2-uk",
    "name": "TNT Sports 2",
    "title": "TNT Sports 2",
    "image": "https://cdn.mos.cms.futurecdn.net/y3oPitXYAwGJnyTHFYo5qB.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/tntsports2-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tntsports2-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TNT Sports 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tntsports2-uk",
        "type": "0"
      },
      {
        "title": "TNT Sports 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tnt-sports-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tnt_sports_3",
    "slug": "tnt-sports-3",
    "cdxSlug": "tntsports3-uk",
    "name": "TNT Sports 3",
    "title": "TNT Sports 3",
    "image": "https://cdn.mos.cms.futurecdn.net/y3oPitXYAwGJnyTHFYo5qB.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/tntsports3-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tntsports3-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TNT Sports 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tntsports3-uk",
        "type": "0"
      },
      {
        "title": "TNT Sports 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tnt-sports-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tnt_sports_4",
    "slug": "tnt-sports-4",
    "cdxSlug": "tntsports4-uk",
    "name": "TNT Sports 4",
    "title": "TNT Sports 4",
    "image": "https://cdn.mos.cms.futurecdn.net/y3oPitXYAwGJnyTHFYo5qB.jpeg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/tntsports4-uk",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tntsports4-uk\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TNT Sports 4 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tntsports4-uk",
        "type": "0"
      },
      {
        "title": "TNT Sports 4 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tnt-sports-4/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_trutv",
    "slug": "trutv",
    "cdxSlug": "trutv-usa",
    "name": "TruTV",
    "title": "TruTV",
    "image": "https://i.ibb.co/DfGcnjXY/Header-tru-TV.webp",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/trutv-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/trutv-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TruTV (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/trutv-usa",
        "type": "0"
      },
      {
        "title": "TruTV (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/trutv/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tudn",
    "slug": "tudn",
    "cdxSlug": "tudn-usa",
    "name": "TUDN",
    "title": "TUDN",
    "image": "https://cdn.aptoide.com/imgs/e/e/6/ee65573e3ed2c5fcafa0191860afdf51_fgraphic.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/tudn-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tudn-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TUDN (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tudn-usa",
        "type": "0"
      },
      {
        "title": "TUDN (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tudn/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_tyc_sports_internacional",
    "slug": "tyc-sports-internacional",
    "cdxSlug": "tycsports-usa",
    "name": "TYC Sports Internacional",
    "title": "TYC Sports Internacional",
    "image": "https://assets.goal.com/images/v3/blta396e76391fffdfa/TyC_Sports_logo.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/tycsports-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/tycsports-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "TYC Sports Internacional (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/tycsports-usa",
        "type": "0"
      },
      {
        "title": "TYC Sports Internacional (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/tyc-sports-internacional/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_ufc_fight_pass_24_7",
    "slug": "ufc-fight-pass-24-7",
    "cdxSlug": "ufc-fight-pass",
    "name": "UFC Fight Pass 24/7",
    "title": "UFC Fight Pass 24/7",
    "image": "https://fightrecord.co.uk/wp-content/uploads/2020/12/ufc-fight-pass-lion-fight-muay-thai.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/ufc-fight-pass",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/ufc-fight-pass\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "UFC Fight Pass 24/7 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/ufc-fight-pass",
        "type": "0"
      },
      {
        "title": "UFC Fight Pass 24/7 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/ufc-fight-pass-24-7/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_usa_network",
    "slug": "usa-network",
    "cdxSlug": "usanetwork-usa",
    "name": "USA Network",
    "title": "USA Network",
    "image": "https://variety.com/wp-content/uploads/2013/10/usa-network-logo1.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/usanetwork-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/usanetwork-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "USA Network (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/usanetwork-usa",
        "type": "0"
      },
      {
        "title": "USA Network (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/usa-network/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_wapa_america",
    "slug": "wapa-america",
    "cdxSlug": "wapaamerica-usa",
    "name": "WAPA America",
    "title": "WAPA America",
    "image": "https://m.media-amazon.com/images/I/81AEkpHaIPL._SL1920_.png",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/wapaamerica-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/wapaamerica-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "WAPA America (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/wapaamerica-usa",
        "type": "0"
      },
      {
        "title": "WAPA America (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/wapa-america/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_wapa_deportes",
    "slug": "wapa-deportes",
    "cdxSlug": "wapadeportes-usa",
    "name": "WAPA Deportes",
    "title": "WAPA Deportes",
    "image": "https://i.ibb.co/pBzhsJ17/WAPA-Deportes.jpg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/wapadeportes-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/wapadeportes-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "WAPA Deportes (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/wapadeportes-usa",
        "type": "0"
      },
      {
        "title": "WAPA Deportes (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/wapa-deportes/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_willow_cricket",
    "slug": "willow-cricket",
    "cdxSlug": "willow-usa",
    "name": "Willow Cricket",
    "title": "Willow Cricket",
    "image": "https://mgpindia.com/wp-content/uploads/2021/10/willow-logo.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/willow-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/willow-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Willow Cricket (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/willow-usa",
        "type": "0"
      },
      {
        "title": "Willow Cricket (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/willow-cricket/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_willow_cricket_2",
    "slug": "willow-cricket-2",
    "cdxSlug": "willow2-usa",
    "name": "Willow Cricket 2",
    "title": "Willow Cricket 2",
    "image": "https://d229kpbsb5jevy.cloudfront.net/tv/1920/1080/languages/WILLOW-2.jpg",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/willow2-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/willow2-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Willow Cricket 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/willow2-usa",
        "type": "0"
      },
      {
        "title": "Willow Cricket 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/willow-cricket-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_movistar_plus",
    "slug": "movistar-plus",
    "cdxSlug": "movistarplus-es",
    "name": "Movistar Plus",
    "title": "Movistar Plus",
    "image": "https://imagenes.hobbyconsolas.com/uploads/imagenes/2026/05/11/6a01f2422d3b19-96205427.jpeg",
    "flag": "us",
    "category": "Entertainment",
    "genre": "Entertainment",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/movistarplus-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/movistarplus-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Movistar Plus (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/movistarplus-es",
        "type": "0"
      },
      {
        "title": "Movistar Plus (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/movistar-plus/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_movistar_deportes",
    "slug": "movistar-deportes",
    "cdxSlug": "movistardeportes-es",
    "name": "Movistar Deportes",
    "title": "Movistar Deportes",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/movistardeportes.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/movistardeportes-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/movistardeportes-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Movistar Deportes (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/movistardeportes-es",
        "type": "0"
      },
      {
        "title": "Movistar Deportes (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/movistar-deportes/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_movistar_deportes_2",
    "slug": "movistar-deportes-2",
    "cdxSlug": "movistardeportes2-es",
    "name": "Movistar Deportes 2",
    "title": "Movistar Deportes 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/movistardeportes.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/movistardeportes2-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/movistardeportes2-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Movistar Deportes 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/movistardeportes2-es",
        "type": "0"
      },
      {
        "title": "Movistar Deportes 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/movistar-deportes-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_movistar_deportes_3",
    "slug": "movistar-deportes-3",
    "cdxSlug": "movistardeportes3-es",
    "name": "Movistar Deportes 3",
    "title": "Movistar Deportes 3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/movistardeportes.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/movistardeportes3-es",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/movistardeportes3-es\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Movistar Deportes 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/movistardeportes3-es",
        "type": "0"
      },
      {
        "title": "Movistar Deportes 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/movistar-deportes-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bein_sports_francais_1",
    "slug": "bein-sports-francais-1",
    "cdxSlug": "beinsports1-fr",
    "name": "beIN Sports Francais 1",
    "title": "beIN Sports Francais 1",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/beinsports.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/beinsports1-fr",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/beinsports1-fr\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "beIN Sports Francais 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/beinsports1-fr",
        "type": "0"
      },
      {
        "title": "beIN Sports Francais 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bein-sports-francais-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bein_sports_francais_2",
    "slug": "bein-sports-francais-2",
    "cdxSlug": "beinsports2-fr",
    "name": "beIN Sports Francais 2",
    "title": "beIN Sports Francais 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/beinsports.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/beinsports2-fr",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/beinsports2-fr\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "beIN Sports Francais 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/beinsports2-fr",
        "type": "0"
      },
      {
        "title": "beIN Sports Francais 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bein-sports-francais-2/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_bein_sports_francais_3",
    "slug": "bein-sports-francais-3",
    "cdxSlug": "beinsports3-fr",
    "name": "beIN Sports Francais 3",
    "title": "beIN Sports Francais 3",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/beinsports.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/beinsports3-fr",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/beinsports3-fr\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "beIN Sports Francais 3 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/beinsports3-fr",
        "type": "0"
      },
      {
        "title": "beIN Sports Francais 3 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/bein-sports-francais-3/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_fox_soccer_plus",
    "slug": "fox-soccer-plus",
    "cdxSlug": "foxsoccerplus-usa",
    "name": "Fox Soccer Plus",
    "title": "Fox Soccer Plus",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/bltfb11a777ebe0535b.webp",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 2,
    "embedUrl": "https://epiembeds.online/embed/foxsoccerplus-usa",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/foxsoccerplus-usa\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "Fox Soccer Plus (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/foxsoccerplus-usa",
        "type": "0"
      },
      {
        "title": "Fox Soccer Plus (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/fox-soccer-plus/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_sportdigital_fussball",
    "slug": "sportdigital-fussball",
    "cdxSlug": "sportdigitalfussball-de",
    "name": "SPORTDIGITAL FUSSBALL",
    "title": "SPORTDIGITAL FUSSBALL",
    "image": "https://image.discovery.indazn.com/ca/v2/ca/image?id=712wbfqz8apl1k09rf681eqxd_image-header_pDach_1661948855000&amp;quality=70",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 4,
    "embedUrl": "https://epiembeds.online/embed/sportdigitalfussball-de",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/sportdigitalfussball-de\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "SPORTDIGITAL FUSSBALL (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/sportdigitalfussball-de",
        "type": "0"
      },
      {
        "title": "SPORTDIGITAL FUSSBALL (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/sportdigital-fussball/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_extra_1",
    "slug": "canal-extra-1",
    "cdxSlug": "canalextra1-pl",
    "name": "CANAL+ Extra 1",
    "title": "CANAL+ Extra 1",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canalextra.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 3,
    "embedUrl": "https://epiembeds.online/embed/canalextra1-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalextra1-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Extra 1 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalextra1-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Extra 1 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-extra-1/1",
        "type": "0"
      }
    ]
  },
  {
    "id": "cdx_canal_extra_2",
    "slug": "canal-extra-2",
    "cdxSlug": "canalextra2-pl",
    "name": "CANAL+ Extra 2",
    "title": "CANAL+ Extra 2",
    "image": "https://cdn.jsdelivr.net/gh/willthequeencome/img-cdn/canalextra.png",
    "flag": "us",
    "category": "Sports",
    "genre": "Sports",
    "viewers": 1,
    "embedUrl": "https://epiembeds.online/embed/canalextra2-pl",
    "iframeHtml": "<iframe src=\"https://epiembeds.online/embed/canalextra2-pl\" width=\"100%\" height=\"100%\" frameborder=\"0\" scrolling=\"no\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen></iframe>",
    "decoded_channels": [
      {
        "title": "CANAL+ Extra 2 (CDX Ultra HD)",
        "link": "https://epiembeds.online/embed/canalextra2-pl",
        "type": "0"
      },
      {
        "title": "CANAL+ Extra 2 (Server 2 - Mirror)",
        "link": "https://embed.st/embed/admin/canal-extra-2/1",
        "type": "0"
      }
    ]
  }
];

export const fetchCdxChannels = (category = 'all') => {
  if (category === 'all') return CDX_USA_WORLD_CHANNELS;
  return CDX_USA_WORLD_CHANNELS.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
};

export const fetchCdxSportsByRegion = (region = 'all') => {
  const sports = CDX_USA_WORLD_CHANNELS.filter(c => c.genre === 'Sports');
  if (region === 'all') return sports;
  if (region === 'us') return sports.filter(c => c.flag === 'us');
  if (region === 'gb') return sports.filter(c => c.flag === 'gb' || c.flag === 'ie');
  if (region === 'eu') return sports.filter(c => ['es', 'de', 'it', 'pt', 'pl', 'fr'].includes(c.flag));
  if (region === 'au') return sports.filter(c => ['au', 'nz'].includes(c.flag));
  if (region === 'combat') return sports.filter(c => c.slug.includes('ufc') || c.slug.includes('fight') || c.slug.includes('motogp') || c.slug.includes('racer'));
  if (region === 'cricket') return sports.filter(c => c.slug.includes('cricket') || c.slug.includes('willow') || c.slug.includes('501'));
  return sports;
};
