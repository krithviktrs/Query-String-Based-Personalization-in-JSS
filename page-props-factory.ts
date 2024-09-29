import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import {
  LayoutServiceData,
  LayoutService,
  editingDataService,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { layoutServiceFactory } from 'lib/layout-service-factory';

export class SitecorePagePropsFactory {
  private layoutService: LayoutService;

  constructor() {
    this.layoutService = layoutServiceFactory.create();
  }

  public async create(
    context: GetServerSidePropsContext | GetStaticPropsContext
  ): Promise<SitecorePageProps> {
    let layoutData: LayoutServiceData | null;
    let notFound = false;

    /** Query string-based personalization implementation **/
    const SRRContext: any = context;
    const resolvedUrl = SRRContext?.resolvedUrl;

    if (resolvedUrl?.includes("?")) {
      const queryStringIndex = resolvedUrl.indexOf('?');
      const queryStringPart = resolvedUrl.substring(queryStringIndex);
      this.layoutService = layoutServiceFactory.createWithQuery(queryStringPart);
    } else {
      this.layoutService = layoutServiceFactory.create();
    }

    const path = extractPath(context.params);
    const locale = context.locale ?? packageConfig.language;

    layoutData = await this.layoutService.fetchLayoutData(path, locale);

    if (!layoutData.sitecore.route) {
      notFound = true;
    }

    return {
      layoutData,
      notFound,
    };
  }
}

export const sitecorePagePropsFactory = new SitecorePagePropsFactory();
