install: deps-install
	npx simple-git-hooks

run:
	npx ts-node bin/analyze-jobs.ts

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
