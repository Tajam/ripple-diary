from bs4 import BeautifulSoup
from selenium import webdriver

URL = 'https://fontawesome.com/cheatsheet?from=io'
config = open('drivers/config').read()
driver = webdriver.Chrome('drivers/'+config)
driver.get(URL)
soup = BeautifulSoup(driver.page_source,'lxml')
types = ['solid','brands']
for n in types:
    articles = soup.find('section',{'id':n}).find_all('article')
    file = open(n+'.fal','w')
    for article in articles:
        file.write(article.find('dd').getText()+' ')
    file.close()
print('Icon list updated!')
driver.quit()
