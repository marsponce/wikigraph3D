# Wikigraph3D

<p align="center">
    <a href="https://github.com/marceloponceardon/wikigraph3D/" target="_blank">
        <!-- Insert logo here -->
    </a>
</p>
<p align="center">
    A 3D graph connecting wikipedia articles by their hyperlinks.
</p>
<div align="center">
    <img width="600" height="600" alt="out" src="https://github.com/user-attachments/assets/a0469983-85da-428a-9a5b-889a8fe4f5ef" />

[![Netlify Status](https://api.netlify.com/api/v1/badges/c6c521be-c5c7-41f6-bfd4-b52ecfcebcfd/deploy-status)](https://app.netlify.com/projects/wikigraph3d/deploys)
</div>   



## Getting Started

_This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)._

<!-- TODO:
### Run Locally
-->

### Development

0. `git clone` the repository
1. `npm install` the required packages
2. `npm run dev` to run the development server

**\*Note**: A supabase database with the following tables is required:

### `nodes` Table

| Column       | Type                       | Constraints                   | Default                    |
| ------------ | -------------------------- | ----------------------------- | -------------------------- |
| `id`         | `bigint`                   | PRIMARY KEY, UNIQUE, NOT NULL | -                          |
| `name`       | `text`                     | NOT NULL                      | -                          |
| `created_at` | `timestamp with time zone` | NOT NULL                      | `now() AT TIME ZONE 'utc'` |
| `thumbnail`  | `json`                     | NULL                          | -                          |
| `content`    | `json`                     | NULL                          | -                          |

### `links` Table

| Column       | Type                       | Constraints                                                         | Default                    |
| ------------ | -------------------------- | ------------------------------------------------------------------- | -------------------------- |
| `id`         | `bigint`                   | PRIMARY KEY, NOT NULL, IDENTITY                                     | Generated                  |
| `source`     | `bigint`                   | NULL, FOREIGN KEY → `nodes(id)` ON UPDATE CASCADE ON DELETE CASCADE | -                          |
| `target`     | `bigint`                   | NULL, FOREIGN KEY → `nodes(id)` ON UPDATE CASCADE ON DELETE CASCADE | -                          |
| `created_at` | `timestamp with time zone` | NOT NULL                                                            | `now() AT TIME ZONE 'utc'` |

(see `.env.example` for where to put relevant environmental variables)

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

_See the current status of the project [HERE](https://github.com/users/marceloponceardon/projects/12) for development tickets._

<!--
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
-->

<!--
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
-->

## Tech Stack

- [Next.js](https://nextjs.org) (Framework)
- [THREE.js](https://threejs.org), [react-three-fiber](https://github.com/pmndrs/react-three-fiber), [react-three-drei](https://github.com/pmndrs/drei), [react-force-graph](https://github.com/vasturiano/react-force-graph?tab=readme-ov-file) (3D Rendering)
- [Wikimedia API](https://api.wikimedia.org/wiki/Main_Page) (Wikipedia Article Fetching)

<!-- TODO:
## License
-->

<p align="center">
    made by: Mars Ponce
</p>
