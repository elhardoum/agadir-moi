import React, { Component } from 'react'

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'

import Loading from './Loading'
import Login from './Login'
import LostPassword from './LostPassword'
import ResetPassword from './ResetPassword'
import AccountSettings from './AccountSettings'
import Logout from './Logout'
import Error404 from './Error404'
import Account from './Account'

import './../style.scss'

export default class Wrap extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      component: 'loading',
      user: null,
    }

    this._MOUNTED = null
    this._RESIZE_EVENT = null
    this.REF_SIDEBAR = React.createRef()
    this.REF_CONTENT = React.createRef()
    this.REF_MENU_TOGGLE = React.createRef()
    this.MENU_TOGGLER_CSS = document.createElement('style')
    this.MENU_TOGGLER_CSS.type = 'text/css'
    this.MENU_TOGGLER_CSS.textContent = '#main-nav > ul .has-child .subnav,#main-nav > ul .has-child .subarrow{display:none!important}'
  }

  async componentDidMount()
  {
    this._MOUNTED = true

    try {
      let user = await fetch('/api/auth').then(res => res.json())

      let component

      if ( user === null || 'object' !== typeof user || Array.isArray(user) || ! user.id ) {
        user = {}
        component = 'login'
      } else {
        component = 'script'
      }

      this._MOUNTED && this.setState({ user, component })
    } catch (e) {
      this._MOUNTED && this.setState({ user: {}, component: 'login' })
    }

    window.addEventListener('resize', this._RESIZE_EVENT = e =>
    {
      if ( document.documentElement.clientWidth >= 730 ) {
        document.body.classList.remove('sticky-sidebar')
        ;(document.getElementById('menu-overlay')||{click:_=>1}).click()
      } else {
        document.body.classList.add('sticky-sidebar')
      }
    }, false)

    this._RESIZE_EVENT && this._RESIZE_EVENT()
  }

  componentWillUnmount()
  {
    this._MOUNTED = false

    this._RESIZE_EVENT && window.removeEventListener('resize', this._RESIZE_EVENT)
  }

  toggleMenu()
  {
    const side = this.REF_SIDEBAR.current
        , content = this.REF_CONTENT.current

    if ( ! side || ! content )
      return

    if ( side.style.cssText ) {
      let end1, end2
      side.addEventListener('transitionend', end1 = _ => (side.style.cssText='', side.removeEventListener('transitionend', end1)))
      content.addEventListener('transitionend', end2 = _ => (content.style.cssText='', content.removeEventListener('transitionend', end2)))

      side.style.transform = 'translate3d(0px, 0, 0)'
      content.style.transform = 'translate3d(0px, 0, 0)'

      ;(document.getElementById('menu-overlay')||{remove:_=>1}).remove()
    } else {
      side.style.cssText = 'position:fixed;top:0;height:100%;display:block;z-index:9;transition:transform .2s;-webkit-transition:transform .2s;-moz-transition:transform .2s;-ms-transition:transform .2s;box-shadow:1px 0 1.5rem #555'
      side.style.left = `${-side.clientWidth}px`
      side.style.transform = `translate3d(${side.clientWidth}px, 0, 0)`

      content.style.cssText = 'transition:transform .2s;-webkit-transition:transform .2s;-moz-transition:transform .2s;overflow:hidden'
      content.style.transform = `translate3d(${side.clientWidth/*+15*/}px, 0, 0)`

      let overlay = document.createElement('div')
      overlay.className = 'fixed h-full pin w-full'
      overlay.id = 'menu-overlay'
      overlay.style.cssText = 'background:rgba(254, 244, 232, 0.38823529411764707)'
      overlay.addEventListener('click', _ => this.toggleMenu(), false)
      content.parentElement.appendChild(overlay)
    }

    document.activeElement.blur()
  }

  maybeCloseMenu()
  {
    document.getElementById('menu-overlay') && this.toggleMenu()
  }

  render()
  {
    const { component, user } = this.state

    let props = {
      component, user,
      updateUser: n => this.setState({ user: n }),
      setGlobalState: ( state, then ) => this.setState( state, _ => then && then(_) ),
      getGlobalState: key => key in this.state ? this.state[key] : undefined,
    }

    if ( null === user ) {
      return <Loading {...this.props} className="w-full" />
    }

    const renderProxy = ( content, routerProps ) =>
    {
      return (<div id="wrap" className="flex flex-1 items-stretch overflow-y-scroll">
        <div id="content" className="flex-1 font-open-sans" ref={this.REF_CONTENT}>
          <div className="py-6">{content}</div>
        </div>
      </div>)
    }, hideSubnav = _ => (document.body.appendChild(this.MENU_TOGGLER_CSS), setTimeout(_ => document.body.removeChild(this.MENU_TOGGLER_CSS), 200))

    return (
      <Router>
        <nav id="main-nav" ref={this.REF_SIDEBAR}>
          <ul className="items-center pl-0">
            <li className="nav-item flex items-center">
              <span ref={this.REF_MENU_TOGGLE} className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 512 512" style={{ height: 22, width: 22, marginRight: 5, fill: '#555', cursor: 'pointer' }}
                  onClick={e => this.toggleMenu()}>
                  <g><g><g><circle cx="256" cy="256" r="64"></circle> <circle cx="256" cy="448" r="64"></circle> <circle cx="256" cy="64" r="64"></circle></g></g></g>
                </svg>
              </span>

              <Link to='/' className="m-auto" onClick={e => this.maybeCloseMenu()}>
                <img src="/assets/images/logo.png" className="h-10 w-10" />
              </Link>
            </li>
            <li className="nav-item block has-child">
              <Link to='/complaints' className="flex items-center" onClick={e => this.maybeCloseMenu()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"></path>
                </svg>
                <span className="ml-2">Complaints</span>
                <svg className="ml-2 submenu-hint" xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M12.5986 0.875H1.40168C0.158084 0.875 -0.469378 2.35691 0.411747 3.22225L6.01008 8.72225C6.55678 9.25919 7.44325 9.25923 7.98999 8.72225L13.5886 3.22225C14.4679 2.35862 13.8447 0.875 12.5986 0.875ZM7.00001 7.75L1.40002 2.25H12.6L7.00001 7.75Z" fill="white"/>
                </svg>
              </Link>

              <svg className="subarrow" width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"></path></svg>

              <div className="subnav">
                <ul className="list-reset">
                  <li>
                    <Link to='/complaints/categories' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"></path>
                      </svg>
                      <span className="ml-2">Categories</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li className="nav-item block has-child">
              <Link to='/users' className="flex items-center" onClick={e => this.maybeCloseMenu()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"></path>
                </svg>
                <span className="ml-2">Users</span>
                <svg className="ml-2 submenu-hint" xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M12.5986 0.875H1.40168C0.158084 0.875 -0.469378 2.35691 0.411747 3.22225L6.01008 8.72225C6.55678 9.25919 7.44325 9.25923 7.98999 8.72225L13.5886 3.22225C14.4679 2.35862 13.8447 0.875 12.5986 0.875ZM7.00001 7.75L1.40002 2.25H12.6L7.00001 7.75Z" fill="white"/>
                </svg>
              </Link>

              <svg className="subarrow" width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"></path></svg>

              <div className="subnav">
                <ul className="list-reset">
                  <li>
                    <Link to='/users/new' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg className="inline" width="20" height="17" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.7583 7.24186C15.0922 9.57815 15.0601 13.3238 12.7724 15.6243C12.7681 15.629 12.763 15.634 12.7583 15.6387L10.1333 18.2637C7.81807 20.579 4.05131 20.5787 1.73643 18.2637C-0.578809 15.9489 -0.578809 12.1817 1.73643 9.86686L3.18588 8.4174C3.57026 8.03303 4.23221 8.2885 4.25205 8.8317C4.27736 9.52397 4.40151 10.2195 4.63057 10.8911C4.70815 11.1185 4.65272 11.3701 4.48279 11.54L3.97158 12.0512C2.87682 13.146 2.84248 14.9286 3.92647 16.034C5.02115 17.1504 6.82045 17.1571 7.92354 16.054L10.5485 13.4294C11.6497 12.3281 11.6451 10.5482 10.5485 9.45162C10.404 9.30733 10.2583 9.19522 10.1446 9.1169C10.0641 9.06164 9.99768 8.98833 9.95056 8.90284C9.90345 8.81734 9.87696 8.72202 9.87323 8.62447C9.85776 8.2117 10.004 7.78635 10.3302 7.46018L11.1526 6.63772C11.3683 6.42205 11.7066 6.39557 11.9567 6.5701C12.2431 6.77008 12.5113 6.99486 12.7583 7.24186ZM18.2636 1.73631C15.9487 -0.578613 12.1819 -0.578926 9.8667 1.73631L7.2417 4.36131C7.23701 4.366 7.23194 4.37107 7.22764 4.37576C4.9399 6.67623 4.90783 10.4219 7.2417 12.7582C7.48869 13.0052 7.75692 13.2299 8.0433 13.4299C8.29338 13.6044 8.63174 13.5779 8.84737 13.3623L9.66979 12.5398C9.99596 12.2137 10.1422 11.7883 10.1267 11.3755C10.123 11.278 10.0965 11.1827 10.0494 11.0972C10.0023 11.0117 9.93585 10.9384 9.85537 10.8831C9.74162 10.8048 9.596 10.6927 9.45143 10.5484C8.35483 9.45178 8.35022 7.67186 9.45143 6.57064L12.0764 3.94604C13.1795 2.84295 14.9788 2.84959 16.0735 3.96596C17.1575 5.07143 17.1232 6.854 16.0284 7.94877L15.5172 8.45998C15.3473 8.6299 15.2918 8.88147 15.3694 9.10889C15.5985 9.78053 15.7226 10.476 15.7479 11.1683C15.7678 11.7115 16.4297 11.967 16.8141 11.5826L18.2635 10.1331C20.5788 7.81834 20.5788 4.05115 18.2636 1.73631Z" fill="white"/>
                      </svg>
                      <span className="ml-2">New User</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li className="nav-item block">
              <Link to='/settings' className="flex items-center" onClick={e => this.maybeCloseMenu()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"></path>
                </svg>
                <span className="ml-2">Settings</span>
              </Link>
            </li>

            <li className="nav-item block has-child">
              <Link to={ user && user.id ? '/account' : '/login?next=%2Faccount' } className="flex items-center" onClick={e => this.maybeCloseMenu()}>
                { user && user.gravatar ? <img src={user.gravatar} className="align-middle rounded-full" width="20" height="20" /> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"></path>
                </svg>}
                <span className="ml-2">{ (user ? [user.first_name, user.last_name] : []).filter(Boolean).join(' ') || 'My Account' }</span>
                <svg className="ml-2 submenu-hint" xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M12.5986 0.875H1.40168C0.158084 0.875 -0.469378 2.35691 0.411747 3.22225L6.01008 8.72225C6.55678 9.25919 7.44325 9.25923 7.98999 8.72225L13.5886 3.22225C14.4679 2.35862 13.8447 0.875 12.5986 0.875ZM7.00001 7.75L1.40002 2.25H12.6L7.00001 7.75Z" fill="white"/>
                </svg>
              </Link>

              <svg className="subarrow" width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"></path></svg>

              <div className="subnav">
                { user && user.id ? <ul className="list-reset">
                  <li>
                    <Link to='/account' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg className="inline" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"/>
                      </svg>
                      <span className="ml-2">My Account</span>
                    </Link>
                  </li>
                  <li>
                    <Link to='/logout' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg className="inline" width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.875 0H7.03125C7.28906 0 7.5 0.210938 7.5 0.46875V0.78125C7.5 1.03906 7.28906 1.25 7.03125 1.25H1.875C1.53125 1.25 1.25 1.53125 1.25 1.875V13.125C1.25 13.4688 1.53125 13.75 1.875 13.75H7.03125C7.28906 13.75 7.5 13.9609 7.5 14.2188V14.5312C7.5 14.7891 7.28906 15 7.03125 15H1.875C0.839844 15 0 14.1602 0 13.125V1.875C0 0.839844 0.839844 0 1.875 0ZM12.7734 0.761719L12.4961 1.03906C12.3125 1.22266 12.3125 1.51953 12.4961 1.70312L17.6523 6.83594H6.71875C6.46094 6.83594 6.25 7.04688 6.25 7.30469V7.69531C6.25 7.95312 6.46094 8.16406 6.71875 8.16406H17.6523L12.5 13.2969C12.3164 13.4805 12.3164 13.7773 12.5 13.9609L12.7773 14.2383C12.9609 14.4219 13.2578 14.4219 13.4414 14.2383L19.8672 7.83203C20.0508 7.64844 20.0508 7.35156 19.8672 7.16797L13.4375 0.761719C13.2539 0.578125 12.957 0.578125 12.7734 0.761719Z" fill="white"/>
                      </svg>
                      <span className="ml-2">Logout</span>
                    </Link>
                  </li>
                </ul> : <ul className="list-reset">
                  <li>
                    <Link to='/login' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg className="inline" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"/>
                      </svg>
                      <span className="ml-2">Login</span>
                    </Link>
                  </li>

                  <li>
                    <Link to='/lost-password' className="flex items-center" onClick={e => (hideSubnav(), this.maybeCloseMenu())}>
                      <svg className="inline" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.47581 0 0 4.47581 0 10C0 15.5242 4.47581 20 10 20C15.5242 20 20 15.5242 20 10C20 4.47581 15.5242 0 10 0ZM10 3.87097C11.9597 3.87097 13.5484 5.45968 13.5484 7.41935C13.5484 9.37903 11.9597 10.9677 10 10.9677C8.04032 10.9677 6.45161 9.37903 6.45161 7.41935C6.45161 5.45968 8.04032 3.87097 10 3.87097ZM10 17.7419C7.63306 17.7419 5.5121 16.6694 4.09274 14.9919C4.85081 13.5645 6.33468 12.5806 8.06452 12.5806C8.16129 12.5806 8.25806 12.5968 8.35081 12.625C8.875 12.7944 9.42339 12.9032 10 12.9032C10.5766 12.9032 11.129 12.7944 11.6492 12.625C11.7419 12.5968 11.8387 12.5806 11.9355 12.5806C13.6653 12.5806 15.1492 13.5645 15.9073 14.9919C14.4879 16.6694 12.3669 17.7419 10 17.7419Z" fill="white"/>
                      </svg>
                      <span className="ml-2">Forgot Password?</span>
                    </Link>
                  </li>
                </ul> }
              </div>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path='/login' render={routerProps => renderProxy(<Login {...routerProps} {...props} />, routerProps)} />
          <Route exact path='/lost-password' render={routerProps => renderProxy(<LostPassword {...routerProps} {...props} />, routerProps)} />
          <Route exact path='/reset-password/:token' render={routerProps => renderProxy(<ResetPassword {...routerProps} {...props} />, routerProps)} />

          {user && user.id && <Route exact path='/logout' render={routerProps => renderProxy(<Logout {...routerProps} {...props} />, routerProps)} />}
          {user && user.id && <Route exact path='/account' render={routerProps => renderProxy(<Account {...routerProps} {...props} />, routerProps)} />}
          {user && user.id && <Route exact path='/account/settings' render={routerProps => renderProxy(<AccountSettings {...routerProps} {...props} />, routerProps)} />}

          <Route render={routerProps => renderProxy(<Error404 {...routerProps} {...props} />, routerProps)} />
        </Switch>

      </Router>
    )
  }
}