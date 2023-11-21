import { Suspense, useEffect, useState } from 'react';
import './App.scss';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

const optionsLimit = 12;

function App() {
  const [launches, setLaunches] = useState([])
  const [launchesDetails, setLaunchesDetails] = useState([])
  const [filterValue, setFilterValue] = useState('')
  const [pageLoaded, setPageLoaded] = useState(false);

  const filteredLaunches = launches.filter(launch => {
    const launch_year = String(new Date(launch.static_fire_date_utc).getFullYear())
    const flight_number = String(launch.flight_number)
    if (launch.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      launch_year.includes(filterValue.toLowerCase()) ||
      flight_number.includes(filterValue.toLowerCase()) ||
      launch.details?.toLowerCase().includes(filterValue.toLowerCase()) ) {
      return launch;
    }
  })

  useEffect(() => {
    console.log(launches)
  }, [launches])

  useEffect(() => {
    if (launches?.length === 0) {
      const payload = {
        query: "",
        options: {
          limit: optionsLimit
        }
      }
      axios.post("https://api.spacexdata.com/v4/launches/query", payload)
      .then(
        res => {
          setLaunches(res.data.docs);
          setLaunchesDetails(res.data);
          setPageLoaded(true);
        },
        err => {
          console.log(err)
        }
      )
    }
  }, [])

  const fetchMoreData = () => {
    console.log('call')
    const payload = {
      query: "",
      options: {
        limit: optionsLimit,
        offset: launchesDetails.offset + optionsLimit
      }
    }
    axios.post("https://api.spacexdata.com/v4/launches/query", payload)
    .then(
      res => {
        setLaunches((prev) => [...prev, ...res.data.docs]);
        setLaunchesDetails(res.data);
      },
      err => {
        console.log(err)
      }
    )
  }

  const LaunchItem  = ({ item }) => {
    const launch_year = new Date(item.static_fire_date_utc).getFullYear()
    return (
      <div className="launch-item">
        <div className="flex items-center">
          <div className="p-2">
            { item.links.patch.small || item.links.patch.large ? <img className="max-w-[60px]" src={ item.links.patch.small || item.links.patch.large } /> :
              <div className="flex justify-center items-center w-[60px] h-[60px] rounded-lg bg-slate-200" >
                <span className="font-semibold text-slate-400 text-xs text-center leading-3">NO <br></br> IMAGE</span>
              </div>
            }
          </div>
          <div className="p-2">
            <div className="mb-1 font-semibold text-sm text-slate-500">{ item.flight_number }: { item.name } ({ launch_year })</div>
            <div className="text-xs text-slate-400 leading-5">Details: { item.details || 'N/A' }</div>
          </div>
        </div>
      </div>
    )
  }
  
  const LaunchItemLoader = () => {
    return (
      <div className="launch-item-loader animate-pulse">
        <div className="flex items-center">
          <div className="p-2">
            <div className="w-[60px] h-[60px] rounded-lg bg-slate-200" ></div>
          </div>
          <div className="p-2">
            <div className="w-32 h-4 rounded-full mb-1 bg-slate-200"></div>
            <div className="w-64 h-2 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Search Bar */}
      <div className="w-full max-w-2xl px-4 mt-4">
        <input className="w-full px-4 py-2 rounded text-xs placeholder:italic placeholder:text-slate-300" placeholder="Enter keywords" value={ filterValue } onChange={ (e) => setFilterValue(e.target.value) } />
      </div>
      {/* List */}
      <div className="w-full max-w-2xl px-4 mt-4">
        <div className="p-4 rounded bg-white">
          { pageLoaded ? <InfiniteScroll dataLength={ launches.length } next={ fetchMoreData } hasMore={ launchesDetails.hasNextPage } loader={ <LaunchItemLoader /> } endMessage={ <div className="flex justify-center"><span className="font-semibold text-slate-400">You're up to date</span></div> }>
            { launches.length > 0 && filteredLaunches.map((item, index) => <LaunchItem key={ index } item={ item } />) }
          </InfiniteScroll> : <LaunchItemLoader /> }
        </div>
      </div>
    </div>
  );
}

export default App;
