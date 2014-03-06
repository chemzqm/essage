build: components index.js essage.css
	@component build --dev
	@touch build

components: component.json
	@component install --dev

clean:
	rm -fr build components

.PHONY: clean
