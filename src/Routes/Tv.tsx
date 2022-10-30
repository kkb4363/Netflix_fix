import { useQuery } from "@tanstack/react-query";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";
import { getPopularTv, IGetTvResult,getAiringTv, getTop_ratedTv, IGetlatestTv, getLatestTv } from "../api";
import {motion, AnimatePresence,useScroll} from 'framer-motion';
import { useEffect, useState } from "react";
import styled from 'styled-components';
import { makeImagePath } from "../utils";
import { AiFillStar } from "react-icons/ai";
import { BsFillArrowRightCircleFill , BsFillArrowLeftCircleFill, BsFillPlayCircleFill} from "react-icons/bs";
const offset = 6;
const API_KEY = '505148347d18c10aeac2faa958dbbf5c';
const BASE_PATH = 'https://api.themoviedb.org/3';
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
const AiringSlider = styled.div`
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
const Row = styled(motion.div)`
display:grid;
gap:5px;
grid-template-columns:repeat(6,1fr);
margin-bottom:5px;
position:absolute;
width:100%;
`
const rowVariants = {
    hidden : (custom:boolean) => ({
      x: custom? window.outerWidth +5 : -window.outerWidth -5 ,
    }),
    visible: {
      x:0,
    },
    exit : (custom:boolean) => ( {
      x: custom? -window.outerWidth -5 : window.outerWidth +5,
    }),
}
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
const PopularSlider = styled.div`
position:relative;
top: 200px;
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

const Top_ratedSlider = styled.div`
position:relative;
top: 500px;
`
function Tv(){
    const useMultipleQuery = () => {
      const Airing = useQuery<IGetTvResult>(['Airing'],getAiringTv)
      const Popular = useQuery<IGetTvResult>(['Popular'],getPopularTv)
      const Top_rate = useQuery<IGetTvResult>(['Top_rate'],getTop_ratedTv)
      return[Airing,Popular,Top_rate]
    }

    const [
      {data:Airingdata, isLoading:loading},
      {data:Populardata},
      {data:Top_ratedata},
    ] =useMultipleQuery()

    const {data:Latestdata} = useQuery<IGetlatestTv>(
      ['latest'],
      getLatestTv
    )
      console.log(Latestdata)
    const [gen,setgen] =useState<any[]>([]);
    useEffect(()=>{
        fetch(`${BASE_PATH}/genre/tv/list?api_key=${API_KEY}&language=ko-KR`)
        .then((res)=>res.json())
        .then((json)=>{
            setgen(json.genres);
        })
    },[])
    
    const navigate = useNavigate();
    const {scrollY} = useScroll();
    const tvPathMatch:PathMatch<string>|null = useMatch('/tv/:tvId');
    const onOverlayClick = () => navigate('/tv');
    const clickTv = tvPathMatch?.params.tvId && Airingdata?.results.find(tv => tv.id+'' === tvPathMatch.params.tvId)
    const clickTv2 = tvPathMatch?.params.tvId && Populardata?.results.find(tv => tv.id+'' === tvPathMatch.params.tvId)
    const clickTv3 = tvPathMatch?.params.tvId && Top_ratedata?.results.find(tv => tv.id+'' === tvPathMatch.params.tvId)

    const onBoxClicked = (tvId:number) => {
        navigate(`/tv/${tvId}`);
    };
    const onDetail = (movieId:string) => {
      navigate(`/tv/${movieId}`);
    }

    const [back, setback] = useState(false);
    const [back2, setback2] = useState(false);
    const [back3, setback3] = useState(false)
    const [index, setIndex] = useState(0);
    const [index2, setIndex2] = useState(0);
    const [index3, setIndex3] = useState(0)
    const [leaving, setLeaving] = useState(false);
    const toggleLeaving = () => setLeaving(prev => !prev);
    

  const AiringPrevBtn = () => {
        if(Airingdata){
            if(leaving) return;
        toggleLeaving();
        const totalTv = Airingdata.results.length ;
        const MaxIndex = Math.floor(totalTv/offset)-1 ;
        setIndex((prev) => prev === 0 ? MaxIndex : prev -1);
        setback(false);
        }
    }
  const AiringNextBtn = () => {
        if(Airingdata){
            if(leaving) return;
        toggleLeaving();
        const totalTv = Airingdata.results.length ;
        const MaxIndex = Math.floor(totalTv/offset)-1 ;
        setIndex((prev) => prev === MaxIndex ? 0 : prev +1);
        setback(true);    
    }
    }
  const PopularPrevBtn = () => {
        if(Populardata){
            if(leaving) return;
        toggleLeaving();
        const totalTv = Populardata.results.length ;
        const MaxIndex2 = Math.floor(totalTv/offset) -1;
        setIndex2((prev)=> prev === 0? MaxIndex2 : prev -1);
        setback2(false);
    }
}
  const PopularNextBtn = () => {
        if(Populardata){
            if(leaving) return;
        toggleLeaving();
        const totalTv = Populardata.results.length ;
        const MaxIndex2 = Math.floor(totalTv/offset) -1;
        setIndex2((prev)=> prev === MaxIndex2? 0 : prev+1);
        setback2(true);
    }
}
  const Top_ratedPrevBtn = () => {
  if(Populardata){
      if(leaving) return;
  toggleLeaving();
  const totalTv = Populardata.results.length ;
  const MaxIndex2 = Math.floor(totalTv/offset) -1;
  setIndex2((prev)=> prev === 0? MaxIndex2 : prev -1);
  setback2(false);
}
}
  const Top_ratedNextBtn = () => {
  if(Populardata){
      if(leaving) return;
  toggleLeaving();
  const totalTv = Populardata.results.length ;
  const MaxIndex2 = Math.floor(totalTv/offset) -1;
  setIndex2((prev)=> prev === MaxIndex2? 0 : prev+1);
  setback2(true);
}
}

    return (
        <Wrapper>
        {loading ? <Loader>Loading...</Loader>
        :<>
        <Banner
        bgPhoto={makeImagePath(Latestdata?.backdrop_path || '')}>
        <Title>{Latestdata?.name}</Title>
        <Overview>{Latestdata?.overview}</Overview>
        <BTN
            onClick={() => onDetail(Latestdata?.id+'')}>자세히 보기</BTN>
        </Banner>

        <AiringSlider>
            <SliderText>Airing Tv</SliderText>
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
                transition={{type:'tween', duration:0.5}}
                key={index}>
                    {Airingdata?.results.slice(2).slice(offset*index, offset*index+offset)
                    .map((tv) => (
                        <Box
                        layoutId={tv.id+''}
                        variants={boxVariants}
                        key={tv.id}
                        whileHover='hover'
                        initial='normal'
                        onClick={()=> onBoxClicked(tv.id)}
                        transition={{type:'tween'}}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w400' || '')}>
                            <Info
                            variants={infoVariants}>
                                <h4>{tv.name}</h4>
                            </Info>
                        </Box>
                    ))}    
                </Row>
                <Prev onClick={AiringPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
                <Next onClick={AiringNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
        </AiringSlider>
        
        <PopularSlider>
            <SliderText>Popular Tv</SliderText>
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
                transition={{type:'tween', duration:0.5}}
                key={index2}>
                    {Populardata?.results.slice(2).slice(offset*index2, offset*index2+offset)
                    .map((tv) => (
                        <Box
                        layoutId={tv.id+''}
                        variants={boxVariants}
                        key={tv.id}
                        whileHover='hover'
                        initial='normal'
                        onClick={()=> onBoxClicked(tv.id)}
                        transition={{type:'tween'}}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w400' || '')}>
                            <Info
                            variants={infoVariants}>
                                <h4>{tv.name}</h4>
                            </Info>
                        </Box>
                    ))}    
                </Row>
                <Prev onClick={PopularPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
                <Next onClick={PopularNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
        </PopularSlider>

        <Top_ratedSlider>
            <SliderText>Top_rated Tv</SliderText>
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
                transition={{type:'tween', duration:0.5}}
                key={index3}>
                    {Top_ratedata?.results.slice(2).slice(offset*index3, offset*index3+offset)
                    .map((tv) => (
                        <Box
                        layoutId={tv.id+''}
                        variants={boxVariants}
                        key={tv.id}
                        whileHover='hover'
                        initial='normal'
                        onClick={()=> onBoxClicked(tv.id)}
                        transition={{type:'tween'}}
                        bgPhoto={makeImagePath(tv.backdrop_path, 'w400' || '')}>
                            <Info
                            variants={infoVariants}>
                                <h4>{tv.name}</h4>
                            </Info>
                        </Box>
                    ))}    
                </Row>
                <Prev onClick={Top_ratedPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
                <Next onClick={Top_ratedNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
        </Top_ratedSlider>


        <AnimatePresence>
            {tvPathMatch ? 
            <>
            <Overlay
            onClick={onOverlayClick}
            animate={{opacity:1}}
            exit={{opacity:0}}/>

            <BigMovie
            layoutId={tvPathMatch.params.tvId}
            style={{top:scrollY.get()+100}}>
                {clickTv && 
                <>
                <BigCover
                style={{backgroundImage:`url(${makeImagePath(clickTv.backdrop_path, 'w500')})`}}/>
                <BigTitle>{clickTv.name}</BigTitle>
                <BigGen>
              {clickTv.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
                <BigOverView>{clickTv.overview}</BigOverView>
                <BigScore><AiFillStar/>{clickTv.vote_average}</BigScore>
                <BigReleaseDate>{clickTv.first_air_date}</BigReleaseDate>
                <BigPlay><BsFillPlayCircleFill/></BigPlay>
                </>}

                {clickTv2 && 
                <>
                <BigCover
                style={{backgroundImage:`url(${makeImagePath(clickTv2.backdrop_path, 'w500')})`}}/>
                <BigTitle>{clickTv2.name}</BigTitle>
                <BigGen>
              {clickTv2.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
                <BigOverView>{clickTv2.overview}</BigOverView>
                <BigScore><AiFillStar/>{clickTv2.vote_average}</BigScore>
                <BigReleaseDate>{clickTv2.first_air_date}</BigReleaseDate>
                <BigPlay><BsFillPlayCircleFill/></BigPlay>
                </>}

                {clickTv3 && 
                <>
                <BigCover
                style={{backgroundImage:`url(${makeImagePath(clickTv3.backdrop_path, 'w500')})`}}/>
                <BigTitle>{clickTv3.name}</BigTitle>
                <BigGen>
              {clickTv3.genre_ids.map((g) => (
                gen.map((v)=>(
                  v.id === g ? (
                    <div>{v.name}</div>
                    
                  ): null
                )) 
              ))}
            </BigGen>
                <BigOverView>{clickTv3.overview}</BigOverView>
                <BigScore><AiFillStar/>{clickTv3.vote_average}</BigScore>
                <BigReleaseDate>{clickTv3.first_air_date}</BigReleaseDate>
                <BigPlay><BsFillPlayCircleFill/></BigPlay>
                </>}
            </BigMovie>
            </>   : null
        }
        </AnimatePresence>

        </>} 
        </Wrapper>
    )
    

}
export default Tv;