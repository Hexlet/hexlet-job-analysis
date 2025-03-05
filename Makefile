setup: install db-setup

install: deps-install
	npx simple-git-hooks

db-setup: db-init db-migrate

db-init:
	npx drizzle-kit generate --name=init

db-generate:
	npx drizzle-kit generate

db-migrate: db-generate
	npx drizzle-kit migrate

jobs-init:
	DEBUG=app* npx tsx bin/analyze-jobs.ts init

jobs-download:
	DEBUG=app* npx tsx bin/analyze-jobs.ts download php

jobs-normalize:
	DEBUG=app* npx tsx bin/analyze-jobs.ts normalize

jobs-analyze:
	DEBUG=app* npx tsx bin/analyze-jobs.ts analize php

deps-install:
	npm ci

deps-update:
	npx ncu -u

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
