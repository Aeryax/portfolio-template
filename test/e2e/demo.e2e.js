describe('Protractor Demo', function() {
	it('should have a title', function() {
		browser.get('http://localhost:3000/');
		expect(browser.getTitle()).toEqual('Starter Template for Bootstrap');
	});
});
