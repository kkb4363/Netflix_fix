import { useQuery } from "@tanstack/react-query";
import { getlatestMovies, getMgenres,  getnowplayingMovies,  gettop_ratedMovies,  getupcomingMovies,  IGetlatestMovie,  IGetMoviesResult, IMovieGenres } from "../api";
import styled from 'styled-components';
import { makeImagePath } from "../utils";
import {motion, AnimatePresence,useScroll} from 'framer-motion';
import { useEffect, useState } from "react";
import {useNavigate, useMatch, PathMatch, useLocation} from 'react-router-dom';
import { BsFillArrowRightCircleFill , BsFillArrowLeftCircleFill, BsFillPlayCircleFill} from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
const Wrapper = styled.div`
background:black;
`
const Loader = styled.div`
height:20vh;
display:flex;
justify-content:center;
align-items:center;
`
const Banner = styled.div<{bgPhoto:string}>`
height:100vh;
display:flex;
flex-direction:column;
justify-contents:center;
padding:60px;
background-image: linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0)) , url(${props => props.bgPhoto});
background-size:cover;
`
const Title = styled.h2`
font-size:68px;
margin-bottom:20px;
`
const Overview = styled.p`
font-size:30px;
width:50%;
`
const Prev = styled.button`
position:absolute;
font-size:50px;
background-color:rgba(0,0,0,0);
left:0;
top:70px;
border:rgba(0,0,0,0);
color:white;
`
const Next = styled.button`
position:absolute;
font-size:50px;
background-color:rgba(0,0,0,0);
right:0;
top:70px;
border:rgba(0,0,0,0);
color:white;
`
const NowSlider = styled.div`
position:relative;
top: -100px;
`
const SliderText = styled.div`
left:0;
position:absolute;
font-size:35px;
width:400px;
height:200px;
top:-50px;
font-weight:400;
`
const Overlay = styled(motion.div)`
position:absolute;
top:0;
width:100%;
height:200%;
background-color:rgba(0,0,0,0.5);
opacity:0;
`
const BigMovie = styled(motion.div)`
position:absolute; 
width:40vw; 
height:80vh;
left:0;
right:0;
margin:0 auto;
border-radius:15px;
overflow:hidden;
background-color:${props=>props.theme.black.lighter};
`
const BigCover = styled.div`
width:100%;
height:400px;
opacity:0.6;
background-size:cover;
background-position:center center;
`
const BigTitle = styled.h3`
color:${props => props.theme.white.lighter};
font-size:45px;
position:relative;
display:flex;
justify-content:center;
align-items:center;
top:-250px;
font-family:cursive;
padding:20px;
`
const BigGen = styled.h4`
color:${props => props.theme.white.lighter};
font-size:20px;
position:relative;
display:flex;
align-items:center;
justify-content:center;
top:-250px;
font-family:cursive;
div{
  margin:0 5px;
  font-weight:bold;
  width:120px;
  height:50px;
  border-radius:20px;
  display:flex;
  justify-content:center;
  align-items:center;
  background-color:rgba(0,0,0,0.2);
}

`
const BigOverView = styled.p`
padding:20px;
margin-top:-150px;
font-family:fantasy;
color:${props => props.theme.white.lighter};
`
const BigScore = styled.div`
position:absolute;
bottom:10px;
padding:20px;
color:${props=>props.theme.white.lighter};
font-size:30px;
`
const BigReleaseDate = styled.p`
padding:20px;
position:absolute;
right:0px;
bottom:10px;
font-size:30px;
color:${props=>props.theme.white.lighter};
`
const BigPlay = styled.div`
position:absolute;
padding:20px;
bottom:50px;
font-size:40px;
border-radius:5px;
cursor:pointer;
color:${props=>props.theme.white.lighter};
`
const Row = styled(motion.div)`
display:grid;
gap:5px;
grid-template-columns:repeat(6,1fr);
margin-bottom:5px;
position:absolute;
width:100%;
`
const Box = styled(motion.div)<{bgPhoto:string}>` 
background-color:white;
height:200px;
background-image:url(${props => props.bgPhoto});
background-size:cover;
background-position:center center;
font-size:66px;
position:relative;
cursor:pointer;
&:first-child{
  transform-origin:center left;
}
&:last-child{
  transform-origin:center right;
}
`
const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`
const rowVariants = {
  hidden : (custom:boolean) => ({
    x: custom? window.outerWidth +5 : -window.outerWidth -5,
  }),
  visible: {
    x:0,
  },
  exit : (custom:boolean) => ( {
    x: custom? -window.outerWidth -5 : +window.outerWidth +5,
  }),
}
const offset = 6;
const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    zIndex:999,
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};
const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};
const Top_ratedSlider = styled.div`
position:relative;
top: 200px;
`

const UpcomingSlider = styled.div`
position:relative;
top: 500px;
`
const LatestSlider = styled.div`
position:relative;
top:800px;
`

const API_KEY = '505148347d18c10aeac2faa958dbbf5c';
const BASE_PATH = 'https://api.themoviedb.org/3';

const BTN = styled.div`
cursor:pointer;
margin-top:20px;
width:100px;
height:50px;
background-color:white;
top:200px;
left:0;
display:flex;
justify-content:center;
align-items:center;
border-radius:20px;
font-weight:bold;
color:black;
`

function Home(){
  const useMultipleQuery = () => {
    const top_rated = useQuery<IGetMoviesResult>(['top_rated'],gettop_ratedMovies);
    const nowPlaying = useQuery<IGetMoviesResult>(['nowPlaying'],getnowplayingMovies);
    const upcoming = useQuery<IGetMoviesResult>(['upcoming'],getupcomingMovies);
    return[top_rated,nowPlaying,upcoming]
  }

  const [
    {data:top_rateddata},
    {data:nowPlayingdata , isLoading:loading},
    {data:upcomingdata},
  ] = useMultipleQuery()

  const {data:latestdata} = useQuery<IGetlatestMovie>(
    ['latest'],
    getlatestMovies
  )
    
  const [gen,setgen] = useState<any[]>([]);
    useEffect(()=>{
      fetch(`${BASE_PATH}/genre/movie/list?api_key=${API_KEY}&language=ko-KR`)
      .then((res)=>res.json())
      .then((json)=>{
        setgen(json.genres);
      })
    },[])
    
    const navigate = useNavigate();
    const {scrollY} = useScroll();
    const moviePathMatch:PathMatch<string>|null = useMatch('/movies/:movieId');
    const onOverlayClick = () => navigate('/React-Netflix');
    const clickedMovie = moviePathMatch?.params.movieId && nowPlayingdata?.results.find(movie => movie.id+'' === moviePathMatch.params.movieId)
    const clickedMovie2 = moviePathMatch?.params.movieId && top_rateddata?.results.find(movie => movie.id+'' === moviePathMatch.params.movieId)
    const clickedMovie3 = moviePathMatch?.params.movieId && upcomingdata?.results.find(movie => movie.id+'' === moviePathMatch.params.movieId)

    const onBoxClicked = (movieId:number) => {
      navigate(`/movies/${movieId}`);
    };
    const onDetail = (movieId:string) => {
      navigate(`/movies/${movieId}`);
    }
    
    
    const [back, setback] = useState(false);
    const [back2, setback2] = useState(false);
    const [back3, setback3] = useState(false);
    const [index, setIndex] = useState(0);
    const [index2, setIndex2] = useState(0);
    const [index3, setIndex3] = useState(0)
    const toggleLeaving = () => setLeaving(prev => !prev);
    const [leaving, setLeaving] = useState(false);

    const NowPrevBtn = () => {
        if(nowPlayingdata){
          if(leaving) return;
        toggleLeaving();
        const totalMovies = nowPlayingdata.results.length -1;
        const maxIndex2 = Math.floor(totalMovies/offset) -1;
        setIndex((prev) => prev === 0 ? maxIndex2 : prev -1);
        setback(false);
        }
    }
    const NowNextBtn = () => {
        if(nowPlayingdata){
          if(leaving) return;
        toggleLeaving();
        const totalMovies = nowPlayingdata.results.length -1; {/*영화 개수 알아내기 , -1을 해주는 이유는 이미 메인페이지에 영화 하나 쓰고있으니깐 */}
        const maxIndex = Math.floor(totalMovies/ offset) -1 ; {/* 인덱스의 길이구하기 , Math.ceil은 올림, -1을 해주는 이유는 page가 0에서 시작하기 때문에 */}
        setIndex((prev) => prev === maxIndex ? 0 : prev + 1); 
        setback(true);
}
    };
    const Top_ratedPrevBtn = () => {
      if(top_rateddata){
        if(leaving) return;
      toggleLeaving();
      const totalMovies2 = top_rateddata.results.length ;
      const maxIndex2 = Math.floor(totalMovies2/offset) -1;
      setIndex2((prev) => prev === 0 ? maxIndex2 : prev -1);
      setback2(false);
      }
    }
    const Top_ratedNextBtn = () => {
      if(top_rateddata){
        if(leaving) return;
      toggleLeaving();
      const totalMovies2 = top_rateddata.results.length ; {/*영화 개수 알아내기 , -1을 해주는 이유는 이미 메인페이지에 영화 하나 쓰고있으니깐 */}
      const maxIndex = Math.floor(totalMovies2/ offset) -1 ; {/* 인덱스의 길이구하기 , Math.ceil은 올림, -1을 해주는 이유는 page가 0에서 시작하기 때문에 */}
      setIndex2((prev) => prev === maxIndex ? 0 : prev + 1); 
      setback2(true);
      }
    };
    const UpcomingPrevBtn = () => {
      if(upcomingdata){
        if(leaving) return;
      toggleLeaving();
      const totalMovies3 = upcomingdata.results.length ;
      const maxIndex2 = Math.floor(totalMovies3/offset) -1;
      setIndex3((prev) => prev === 0 ? maxIndex2 : prev -1);
      setback3(false);
      }
    }
    const UpcomingNextBtn = () => {
      if(upcomingdata){
        if(leaving) return;
      toggleLeaving();
      const totalMovies3 = upcomingdata.results.length ; {/*영화 개수 알아내기 , -1을 해주는 이유는 이미 메인페이지에 영화 하나 쓰고있으니깐 */}
      const maxIndex = Math.floor(totalMovies3/ offset) -1 ; {/* 인덱스의 길이구하기 , Math.ceil은 올림, -1을 해주는 이유는 page가 0에서 시작하기 때문에 */}
      setIndex3((prev) => prev === maxIndex ? 0 : prev + 1); 
      setback3(true);
      }
    };



  return (
        <Wrapper>
          {loading ? <Loader>Loading...</Loader> 
          : <>
          <Banner
          bgPhoto={makeImagePath(latestdata?.backdrop_path || "")}>
            <Title>{latestdata?.title}</Title>
            <Overview>{latestdata?.overview}</Overview>
            <BTN
            onClick={() => onDetail(latestdata?.id+'')}>자세히 보기</BTN>
          </Banner>

          <NowSlider>
            <SliderText>현재 상영중인 영화</SliderText>
            <AnimatePresence
            custom={back} 
            initial={false}
            onExitComplete={toggleLeaving}>
            <Row 
              custom={back}
              variants={rowVariants} 
              initial='hidden' 
              animate='visible' 
              exit='exit'
              transition={{type:"tween", duration:0.5}}
              key={index}
            >
              {nowPlayingdata?.results.slice(offset*index, offset*index+offset)
              .map((movie) => (
                <Box
                layoutId={movie.id+''}
                variants={boxVariants}
                key={movie.id} 
                whileHover='hover'
                initial='normal'
                onClick={()=> onBoxClicked(movie.id)}
                transition={{type:'tween'}}
                bgPhoto={makeImagePath(movie.backdrop_path, 'w400'  || "")}
                >
                <Info variants={infoVariants}>
                <h4>{movie.title}</h4>
                </Info>
                </Box>
              ))} 
            </Row>
            <Prev onClick={NowPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
            <Next onClick={NowNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
          </NowSlider>

          <Top_ratedSlider>
            <SliderText>가장 인기 있는 영화</SliderText>
            <AnimatePresence
            custom={back2} 
            initial={false}
            onExitComplete={toggleLeaving}>
            <Row 
              custom={back2}
              variants={rowVariants} 
              initial='hidden' 
              animate='visible' 
              exit='exit'
              transition={{type:"tween", duration:0.5}}
              key={index2}
            >
              {top_rateddata?.results.slice(2).slice(offset*index2, offset*index2+offset)
              .map((movie2) => (
                <Box
                layoutId={movie2.id+''}
                variants={boxVariants}
                key={movie2.id} 
                whileHover='hover'
                initial='normal'
                onClick={()=> onBoxClicked(movie2.id)}
                transition={{type:'tween'}}
                bgPhoto={makeImagePath(movie2.backdrop_path, 'w400'  || "")}
                >
                <Info variants={infoVariants}>
                <h4>{movie2.title}</h4>
                </Info>
                </Box>
              ))} 
            </Row>
            <Prev onClick={Top_ratedPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
            <Next onClick={Top_ratedNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
          </Top_ratedSlider>

          <UpcomingSlider>
            <SliderText>곧 출시될 영화</SliderText>
            <AnimatePresence
            custom={back3} 
            initial={false}
            onExitComplete={toggleLeaving}>
            <Row 
              custom={back3}
              variants={rowVariants} 
              initial='hidden' 
              animate='visible' 
              exit='exit'
              transition={{type:"tween", duration:0.5}}
              key={index3}
            >
              {upcomingdata?.results.slice(2).slice(offset*index3, offset*index3+offset)
              .map((movie3) => (
                <Box
                layoutId={movie3.id+''}
                variants={boxVariants}
                key={movie3.id} 
                whileHover='hover'
                initial='normal'
                onClick={()=> onBoxClicked(movie3.id)}
                transition={{type:'tween'}}
                bgPhoto={makeImagePath(movie3.backdrop_path, 'w400'  || "")}
                >
                <Info variants={infoVariants}>
                <h4>{movie3.title}</h4>
                </Info>
                </Box>
              ))} 
            </Row>
            <Prev onClick={UpcomingPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
            <Next onClick={UpcomingNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
          </UpcomingSlider>


          <AnimatePresence>
            {moviePathMatch ? 
            <>
            <Overlay 
            onClick={onOverlayClick}
            animate={{opacity : 1}}
            exit={{opacity:0}}
            />
            
            <BigMovie
              layoutId={moviePathMatch.params.movieId}
              style={{top:scrollY.get() + 100}
            }>

            {clickedMovie && 
            <>
            <BigCover 
            style={{
              backgroundImage:`url(${makeImagePath(clickedMovie.backdrop_path, 'w500')})`
              }}/>
            <BigTitle>{clickedMovie.title}</BigTitle>
            <BigGen>
              {clickedMovie.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
            <BigOverView>{clickedMovie.overview}</BigOverView>
            <BigScore><AiFillStar/>{clickedMovie.vote_average}</BigScore>
            <BigReleaseDate>{clickedMovie.release_date}</BigReleaseDate>
            <BigPlay><BsFillPlayCircleFill/></BigPlay>
            </>}

            {clickedMovie2 && 
            <>
            <BigCover 
            style={{
              backgroundImage:`url(${makeImagePath(clickedMovie2.backdrop_path, 'w500')})`
              }}/>
            <BigTitle>{clickedMovie2.title}</BigTitle>
            <BigGen>
              {clickedMovie2.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
            <BigOverView>{clickedMovie2.overview}</BigOverView>
            <BigScore><AiFillStar/>{clickedMovie2.vote_average}</BigScore>
            <BigReleaseDate>{clickedMovie2.release_date}</BigReleaseDate>
            <BigPlay><BsFillPlayCircleFill/></BigPlay>
            </>}

            {clickedMovie3 && 
            <>
            <BigCover 
            style={{
              backgroundImage:`url(${makeImagePath(clickedMovie3.backdrop_path, 'w500')})`
              }}/>
            <BigTitle>{clickedMovie3.title}</BigTitle>
            <BigGen>
              {clickedMovie3.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
            <BigOverView>{clickedMovie3.overview}</BigOverView>
            <BigScore><AiFillStar/>{clickedMovie3.vote_average}</BigScore>
            <BigReleaseDate>{clickedMovie3.release_date}</BigReleaseDate>
            <BigPlay><BsFillPlayCircleFill/></BigPlay>
            </>}


            </BigMovie>
            </>
              : null}
          </AnimatePresence>
          </> }
          </Wrapper>
      );
}
export default Home;

{/* React-query 에러
react18과 react-query4 버전 충돌떄문에
1. package.json 에서 react-query 패키지 삭제
2. npm i @tanstack/react/query
3. import {} from '@tanstack/react-query';
이렇게 써줘야함 
변경 전 : react-query / 변경 후 : @tanstack/react-query
*/}

{/*themoviedb 사이트 api 설명
https://developers.themoviedb.org/3/getting-started/introduction
*/}

{/*React Router 5 => 6 변경점
  1. useHistory() => useNavigate()
  history.push('***') => navigate('***')
  
  2. useRouteMatch() => useMatch()
*/}

{/*bgPhoto가 타입스크립트에 정의되어있지 않아서 에러가뜸
  그럴땐 위로 올려서 box에 정의해주면 됌.*/}

{/* slice(1)을 하는 이유
메인페이지에 사용한 data[0]번의 영화를 제외하기위해서*/}

{/*initial={false}를 해주는 이유
새로고침을 하거나 다른 페이지에서 넘어올때
박스들이 오른쪽에서 슬라이딩하면서 넘어온다.
그래서 그걸 방지하기 위해 해줌.*/}

{/* useQuery([식별자이름,식별자이름],불러올 함수)
  fetch 해온 데이터를 가져와서 데이터가 있는지 , 아직 로딩중인지에 대한 알림을
  전해주는 함수이다.
*/}