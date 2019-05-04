from bs4 import BeautifulSoup
from selenium import webdriver
import platform

class AwesomeScraper:
    @staticmethod
    def get_result():
        fontawesome = {'fas':list(),'fab':list()}
        types = {'fas':'solid','fab':'brands'}
        for n in types:
            file = open(types[n]+'.fal','r')
            fontawesome[n] = file.read().split(' ')
            print('Readed',len(fontawesome[n]),types[n],'fonts...')
            file.close()
        return fontawesome
    
    @staticmethod
    def update():
        URL = 'https://fontawesome.com/cheatsheet?from=io'
        if platform.system() == 'Windows':
            driver_name = 'chromedriver.exe'
        elif platform.system() == 'Linux':
            driver_name = 'geckodriver'
        else:
            raise Exception('Platform not supported!')
        try:
            driver = webdriver.Chrome('drivers/'+driver_name)
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
            return True;
        except:
            return False;

if __name__ == '__main__':
    print('Manual update...')
    AwesomeScraper.update()
