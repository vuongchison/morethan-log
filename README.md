# morethan-log

<img width="1715" alt="image" src="https://user-images.githubusercontent.com/72514247/209824600-ca9c8acc-6d2d-4041-9931-43e34b8a9a5f.png">

Next.js static blog using Notion as a Content Management System (CMS). Supports both Blog format Post as well as Page format for Resume. Deployed using Vercel.

[Demo Blog](https://morethan-log.vercel.app) | [Demo Resume](https://morethan-log.vercel.app/resume)

## Features

**📒 Writing posts using notion**

- No need of commiting to Github for posting anything to your website.
- Posts made on Notion are automaticaly updated on your site.

**📄 Use as a page as resume**

- Useful for generating full page sites using Notion.
- Can be used for Resume, Portfolios etc.

**👀 SEO friendly**

- Dynamically generates OG IMAGEs (thumbnails!) for posts. ([og-image-korean](https://github.com/morethanmin/og-image-korean)).
- Dynamically creates sitemap for posts.

**🤖 Customisable and Supports various plugin through CONFIG**

- Your profile information can be updated through Config. (`site.config.js`)
- Plugins support includes, Google Analytics, Search Console and also Commenting using Github Issues(Utterances) or Cusdis.

## Getting Started

1. Star this repo.
2. [Fork](https://github.com/morethanmin/morethan-log/fork) the repo to your Profile.
3. Duplicate [this Notion template](https://morethanmin.notion.site/12c38b5f459d4eb9a759f92fba6cea36?v=2e7962408e3842b2a1a801bf3546edda).
4. Create an integration at [My integrations](https://www.notion.so/profile/integrations), copy its secret, and add the integration as a connection to the blog database.
5. Copy the blog database ID from its Notion URL. If configuring a page that contains the database, the app will look for a child database.
6. Clone your forked repo and customize `site.config.js` based on your preference.
7. Set these environment variables locally in `.env.local` and in your deployment environment:

   - `NOTION_API_KEY` (Required): The secret for your Notion integration. Keep this server-side; do not use a `NEXT_PUBLIC_` prefix.
   - `NOTION_DATABASE_ID` (Required): The blog database ID, or the ID of a page containing the database. A `NOTION_PAGE_ID` value is accepted as a fallback for existing configurations.
   - `NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID` : For Google analytics Plugin.
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` : For Google search console Plugin.
   - `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` : For Naver search advisor Plugin.
   - `NEXT_PUBLIC_UTTERANCES_REPO` : For Utterances Plugin.

### Notion Webhook Revalidation

The app exposes `POST /api/notion-webhook` for Notion webhook subscriptions. It verifies signed events, clears the server-side Notion cache, and revalidates the home page, sitemap, and current post routes.

1. Deploy the app to a public HTTPS URL. Notion cannot send webhooks to localhost.
2. In [Notion connections](https://app.notion.com/developers/connections), open the connection used by the app and create a webhook subscription with `https://YOUR_DOMAIN/api/notion-webhook` as the URL.
3. Subscribe to `page.content_updated`, `page.created`, `page.deleted`, and `data_source.schema_updated`.
4. Notion sends a one-time verification request. To capture its token, temporarily set `NOTION_WEBHOOK_LOG_CHALLENGE=true` in the deployment environment and redeploy. Create the subscription, then copy the token from the hosting function logs and paste it into Notion's verification dialog.
5. Save the token as `NOTION_WEBHOOK_VERIFICATION_TOKEN` in the deployment environment, remove `NOTION_WEBHOOK_LOG_CHALLENGE`, and redeploy before completing verification. The token is used to validate every webhook signature; never leave challenge logging enabled.
6. Edit a connected Notion page and check webhook delivery status. Content-update events may be aggregated and take around a minute to arrive.

For local development, expose the local server with an HTTPS tunnel and use the tunnel URL as the webhook URL. Do not configure the subscription against `localhost`.

## 10 Steps to build your own morethan-log (by 23.06.23)

<details>
   <summary> Click to see guide </summary>
   
   0. Prepare Notion, Vercel account.

   1. ⭐ `Star` and `Fork` this repo.
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/b0421776-2bfe-42bc-ae31-d90206fd5789' width = '500'>
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/185a8e4c-4ae2-4a38-b6f4-dc2a06a45c28' width = '500'>

   2. As you `click` the [Notion template](https://quasar-season-ed5.notion.site/12c38b5f459d4eb9a759f92fba6cea36?v=2e7962408e3842b2a1a801bf3546edda), you will see this notion page in your browser. Click `Duplicate` button(복제 in image) in right top.
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/a5375429-28f0-4bba-a355-0d391cad58db' width = '500'>

   3. And you will see `notion page in notion app` in your account.
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/09af5533-43d9-48e5-95eb-dcac84c97c1f' width = '500'>

   4. Click `Share` and `Publish` in right top, and check web link. (Copy web link)
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/886fe4a2-79ca-4dbc-b1e1-93984e7e3f44' width = '500'>
   
   5. `Modify` **site.config.js** file in **your** forked repo.
   > 💡 NOTE. I changed **2 RED PART**
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/3d9c0da5-92bc-4372-8752-7bfc810b4986' width = '500'>

   6. Move and `login` to vercel.
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/07742ad0-4766-43b0-9ebd-5311f9711bc2' width = '500'>

   7. `Build` new project using **Add New...**
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/517d46be-c9bf-4181-aaa5-e9bd2fcdc822' width = '500'>

   8. `Import` **your forked morethan-log repository**
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/07742ad0-4766-43b0-9ebd-5311f9711bc2' width = '500'>

   9. `Add` **Environment variabes** to vercel project
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/703b50a3-3a90-4915-ab73-1baca4c285f8' width = '500'>

   10. `Wait` for the deployment to complete. After the deployment is successful, you should see an image like the one below.
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/a7d72caa-4354-4f81-9577-c773faeed7c6' width = '500'>

   🥳 Congratulations. Now check out your blog
   
   <img src='https://github.com/jhk0530/morethan-log/assets/6457691/3876a273-a270-47ef-a2ad-663519d9e537' width = '500'>

</details>

## FAQ

<details>
   <summary> Click to see FAQ </summary>
   Q1: If you finish making avatar.svg, How to make favicon.ico and apple-touch-icon.png?
   
   A1: check out https://www.favicon-generator.org/
   
   Q2: Is it necessary to set up a sitemap file?   
   A2: The system will dynamically create a sitemap.xml, so there is no need for manual setup.

   Q3: Why don’t Notion posts update automatically?   
   A3: Please set the revalidateTime in site.config.js and observe how long it takes to update.
   
   Q4: What should be entered for NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID and NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in site.config.js?
   A4: You can check https://github.com/morethanmin/morethan-log/issues/203. Please note that updates may take some time to take effect after setting.

If you encounter any other issues, please feel free to add them to the GitHub README to assist future users. We look forward to your contributions!

</details>

## Contributing

Check out the [Contributing Guide](.github/CONTRIBUTING.md).

### Contributors

<!--
Contributors template:
<a href="https://github.com/{username}"><img src="{src}" width="50px" alt="{username}" /></a>&nbsp;&nbsp;
-->

<a href="https://github.com/morethanmin/morethan-log/graphs/contributors">
<img src="https://contrib.rocks/image?repo=morethanmin/morethan-log" />
</a>

## Support

morethan-log is an MIT-licensed open source project. It can grow thanks to the sponsors and support from the amazing backers.

### Sponsors

<!--
Sponsors template:
<a href="https://github.com/{uesrname}"><img src="{src}" width="50px" alt="{username}" /></a>&nbsp;&nbsp;
-->

<p>
<a href="https://github.com/siyeons"><img src="https://avatars.githubusercontent.com/u/35549653?v=4" width="50px" alt="siyeons" /></a>&nbsp;&nbsp;
</p>

## License

The [MIT License](LICENSE).
