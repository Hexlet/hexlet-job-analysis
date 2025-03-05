setup: install db-setup

install: deps-install
	npx simple-git-hooks

db-setup: db-migrate

db-init:
	npx drizzle-kit generate --name=init

db-generate:
	npx drizzle-kit generate

db-migrate: db-generate
	npx drizzle-kit migrate

jobs-init:
	DEBUG=app* npx tsx bin/dev.ts init

jobs-download:
	DEBUG=app* npx tsx bin/dev.ts download python

jobs-normalize:
	DEBUG=app* npx tsx bin/dev.ts normalize

jobs-list:
	DEBUG=app* npx tsx bin/dev.ts list python

jobs-analyze:
	DEBUG=app* npx tsx bin/dev.ts analyze python

deps-install:
	npm ci

deps-update:
	npx ncu -u

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	# npm run check-types
	npx eslint .

build:
	npm run build

release: build
	npx release-it

.PHONY: test
