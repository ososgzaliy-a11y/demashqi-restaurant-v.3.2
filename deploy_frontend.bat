call cmd /c npm run build
if exist wrangler.toml ren wrangler.toml wrangler.toml.bak
call cmd /c npx wrangler pages project create demashqi-restaurant --production-branch main
call cmd /c npx wrangler pages deploy dist --project-name demashqi-restaurant --commit-dirty=true
if exist wrangler.toml.bak ren wrangler.toml.bak wrangler.toml
