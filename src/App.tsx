import React from 'react';
import './App.css';
import { Pagination } from './Pagination';

const API_KEY = "ApZac39zpoQjsccufUyM4yP4tuA3ap0OtNJZkpBo";

interface ServiceInit {
  status: 'init';
}
interface ServiceLoading {
  status: 'loading';
}
interface ServiceLoaded<T> {
  status: 'loaded';
  payload: T;
}
interface ServiceError {
  status: 'error';
  error: Error;
}

type Service<T> =
  | ServiceInit
  | ServiceLoading
  | ServiceLoaded<T>
  | ServiceError;

interface Pics {
  copyright: string;
  date: string;
  explanation: string;
  url: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
}
interface Links {
  href: string;
}
interface ImageData {
  title: string;
  date_created: string;
  keywords: string[];
}
interface Image {
  links: Links[];
  href: string;
  data: ImageData[];
}
interface SearchInferface {
  collection: {
    href: string;
    items: Image[];
    version: string;
    links: [];
    metadata: any;
  };
}



const App: React.FC<{}> = () => {
  const [picData, setPicData] = React.useState<Service<Pics>>({
    status: 'loading',
  });
  const [searchData, setSearchData] = React.useState<Service<SearchInferface>>({
    status: 'loading',
  });
  const [searchFlag, setSearchFlag] = React.useState<boolean>(false);
  const [searchTitle, setSearchTitle] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(15);
  const [resultsArr, setResultsArr] = React.useState<any[]>([]);
  const [getKeywords, setKeywords] = React.useState<string[]>([]);
  const handlePages = (updatePage: number) => {
    setPage(updatePage);
  };
  React.useEffect(() => {
    fetch(`${`https://api.nasa.gov/planetary/apod?api_key=` + API_KEY}`)
      .then(response => response.json())
      .then(response => { setPicData({ status: 'loaded', payload: response }); console.log(picData); })
      .catch(error => setPicData({ status: 'error', error }));
  }, []);

  const onSubmit = (event: any) => {
    setSearchFlag(true);
    event.preventDefault();
    let query = event.target[0].value;
    setSearchTitle(query);
    fetch(`${`https://images-api.nasa.gov/search?q=` + query + `&media_type=image`}`)
      .then(response => response.json())
      .then(response => {
        setSearchData({ status: 'loaded', payload: response });
        let total = Math.ceil((response.collection.items.length) / 3);
        setTotalPage(total);
        var searchArr = [];
        while (response.collection.items.length) {
          searchArr.push(response.collection.items.splice(0, 3));
        }
        setResultsArr(searchArr);
        var keywords: string[] = [];
        searchArr[0].forEach((item: Image) => {
          keywords.push(...item.data?.[0]?.keywords);
        });
        var newSet = new Set(keywords);
        var newSetArr = [...newSet][0].indexOf(';') === -1 ? [...newSet] : [...newSet][0].split(';');
        setKeywords([...newSetArr]);

      })
      .catch(error => setSearchData({ status: 'error', error }));
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          NASA Media Search
        </p>
      </header>
      {picData.status === 'loading' && !searchFlag && <div>Loading...</div>}
      {picData.status === 'loaded' && !searchFlag ? <>
        <main className="App-main">
          <div className="Image-title"><p>{picData.payload.title}</p></div>
          <div className="search">
            <p>
              <form onSubmit={onSubmit}>
                <input
                  name='search'
                  id='search'
                  type='text'
                  required
                />
                <button type='submit'>Search</button>
              </form>
            </p>
          </div>
        </main>
        <main>
          <div className="main-image">
            <img src={picData.payload.url} />
            <p>{picData.payload.explanation}</p>
            <p>{picData.payload.date}</p>
            <p>&#169; {picData.payload.copyright}</p>
          </div>
        </main>
      </> :
        <>
          {(searchData.status === 'loading' || !resultsArr.length) && <div>Loading...</div>}
          {searchData.status === 'loaded' && resultsArr.length &&
            <>
              <p>Search Results for {searchTitle}</p>
              <div className="search-page">
                {resultsArr[page - 1].map((item: any) =>
                  <div className="search-result">
                    <img className="search-image" src={item.links[0].href} />
                    <div>
                      <p>{item.data[0].title}</p>
                      <p>{item.data[0].date_created}</p>
                    </div>
                  </div>
                )}
              </div>
              <Pagination
                page={page}
                totalPages={totalPage}
                handlePagination={handlePages}
              />
              <div>
                <p>Related Searches</p>
                <div className="container">
                  <div className="item">{getKeywords[0]}</div>
                  <div className="item">{getKeywords[1]}</div>
                  <div className="item">{getKeywords[2]}</div>
                  <div className="item">{getKeywords[3]}</div>
                </div>
              </div>
            </>
          }{searchData.status === 'error' && (
            <div>No data for this search</div>
          )}
        </>
      }
      {picData.status === 'error' && (
        <div>Error, the backend moved to the dark side.</div>
      )}

    </div>
  );

}

export default App;
