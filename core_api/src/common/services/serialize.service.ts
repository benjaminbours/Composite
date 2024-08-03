// vendors
import type { User as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
// local
import { User } from '../../users/entity';

@Injectable()
export class SerializeService {
  serializeUser = (user: PrismaUser): User => {
    delete (user as any).password;
    delete (user as any).hashedRefreshToken;

    return {
      ...user,
      confirmationToken: Boolean(user.confirmationToken),
    };
  };

  // serializeClient = (
  //   client: PrismaClient & {
  //     user?: PrismaUser;
  //     purchasesAsBuyer?: PrismaPurchase[];
  //     space?: PrismaSpace;
  //     rankingPoints?: PrismaRankingPoints;
  //     rankingPointsHistory?: PrismaRankingPointsHistory[];
  //   },
  //   // TODO: Could be deduced base on who make the request
  //   cleanPrivateFields = true,
  // ): Client => {
  //   const user = client.user ? this.serializeUser(client.user) : undefined;
  //   const space = client.space ? this.serializeSpace(client.space) : undefined;

  //   if (cleanPrivateFields) {
  //     delete (client as any).description;
  //   }

  //   return {
  //     ...client,
  //     space,
  //     purchasesAsBuyer: (client.purchasesAsBuyer || []).map(
  //       this.serializePurchase,
  //     ),
  //     mnemonic: Boolean(client.mnemonic),
  //     user,
  //     rankingPoints: client.rankingPoints,
  //     rankingPointsHistory: client.rankingPointsHistory || [],
  //   };
  // };

  // serializePurchase = (
  //   purchase: PrismaPurchase & {
  //     client?: PrismaClient;
  //     offer?: PrismaOffer;
  //     sponsor?: PrismaClient;
  //     transaction?: PrismaTransaction;
  //     items?: PrismaPurchaseItem[];
  //     _count?: {
  //       items: number;
  //     };
  //   },
  // ): Purchase => {
  //   const sponsor = purchase.sponsor
  //     ? this.serializeClient(purchase.sponsor)
  //     : undefined;
  //   const client = purchase.client
  //     ? this.serializeClient(purchase.client)
  //     : undefined;
  //   const offer = purchase.offer
  //     ? this.serializeOffer(purchase.offer)
  //     : undefined;
  //   return {
  //     ...purchase,
  //     offer,
  //     client,
  //     sponsor,
  //     transaction: purchase.transaction,
  //     reference: Number(purchase.reference),
  //     computedDiscounts:
  //       purchase.computedDiscounts as unknown as ComputedPurchasePrices,
  //     items: (purchase.items || []).map(this.serializePurchaseItem),
  //     itemsCount: purchase._count?.items || 0,
  //   };
  // };

  // serializePurchaseItem = (
  //   item: PrismaPurchaseItem & { template?: PrismaTemplate },
  // ): PurchaseItem => {
  //   const template = item.template
  //     ? this.serializeTemplate(item.template)
  //     : undefined;
  //   return {
  //     ...item,
  //     asset_id: Number(item.asset_id),
  //     template,
  //   };
  // };

  // serializeSwap = (
  //   swap: PrismaSwap & { client?: PrismaClient | null },
  // ): Swap => {
  //   const client = swap.client ? this.serializeClient(swap.client) : null;
  //   return {
  //     ...swap,
  //     client,
  //     reference: Number(swap.reference),
  //   };
  // };

  // serializeOffer = (
  //   offer: PrismaOffer & {
  //     _count?: { offerItems: number };
  //     offerItems?: PrismaOfferItem[];
  //     assetsCountByTemplate?: AssetsCountByTemplate[];
  //     discounts?: PrismaDiscount[];
  //   },
  // ): Offer => {
  //   return {
  //     ...offer,
  //     offerItems: offer.offerItems?.map(this.serializeOfferItem) || [],
  //     lock: offer.lock as any,
  //     reference: Number(offer.reference),
  //     availableQuantity: offer._count?.offerItems || 0,
  //     assetsCountByTemplate: offer.assetsCountByTemplate || [],
  //     discounts:
  //       offer.discounts?.map((discount) => ({
  //         ...discount,
  //         params: discount.params as unknown as ConfigDiscount,
  //       })) || [],
  //   };
  // };

  // serializeOfferItem = (item: PrismaOfferItem): OfferItem => {
  //   return {
  //     ...item,
  //     asset_id: Number(item.asset_id),
  //   };
  // };

  // serializeTemplate = (
  //   template: PrismaTemplate & {
  //     offers?: PrismaOffer[];
  //     space?: PrismaSpace;
  //     sections?: LightSection[];
  //     _count?: {
  //       offerItems: number;
  //     };
  //   },
  // ): Template | TemplatePageData => {
  //   const space = !template.space
  //     ? undefined
  //     : this.serializeSpace(template.space);

  //   const sections = !template.sections
  //     ? undefined
  //     : template.sections.map(this.serializeSection);

  //   return {
  //     ...template,
  //     translations: [],
  //     totalCountInStock: template._count?.offerItems || 0,
  //     offers: (template.offers || []).map(this.serializeOffer),
  //     space,
  //     sections,
  //   };
  // };

  // serializeSection = (
  //   section: PrismaSection & SectionComputedData,
  // ): Section => {
  //   const config = section.config as unknown as ConfigSection;
  //   const items = section.items
  //     ? section.items.map(this.serializeTemplate)
  //     : undefined;

  //   const offer = section.offer
  //     ? this.serializeOffer(section.offer)
  //     : undefined;

  //   return {
  //     ...section,
  //     config,
  //     items,
  //     offer,
  //   };
  // };

  // serializePageContent = (
  //   pageContent: PrismaPageContent & {
  //     sections: (PrismaSection & SectionComputedData)[];
  //   },
  // ): PageContent => {
  //   const sections = pageContent.sections.map(this.serializeSection);
  //   return {
  //     ...pageContent,
  //     sections,
  //   };
  // };

  // serializeSpace = (
  //   space: PrismaSpace & {
  //     offers?: PrismaOffer[];
  //     pageContent?: PrismaPageContent & {
  //       sections: (PrismaSection & SectionComputedData)[];
  //     };
  //     collections?: PrismaCollection[];
  //     creator?: {
  //       id: number;
  //       user: {
  //         firstName: string;
  //         lastName: string;
  //       };
  //     };
  //   },
  // ): Space => {
  //   const offers = (space.offers || []).map(this.serializeOffer);

  //   const pageContent = !space.pageContent
  //     ? null
  //     : this.serializePageContent(space.pageContent);

  //   return {
  //     ...space,
  //     offers,
  //     collections: (space.collections || []).map(this.serializeCollection),
  //     pageContent,
  //   };
  // };

  // serializeStats = (stats: Stats): Stats => {
  //   stats.stats.forEach((statObject) => {
  //     const keys = Object.keys(statObject);
  //     keys.forEach((key) => {
  //       statObject[key] = Number(statObject[key]);
  //     });
  //   });
  //   return stats;
  // };

  // serializeCollection = (
  //   collection: PrismaCollection & { _count?: { templates: number } },
  // ): Collection => {
  //   return {
  //     ...collection,
  //     templatesCount: collection._count?.templates || 0,
  //   };
  // };
}
