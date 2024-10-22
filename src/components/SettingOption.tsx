'use client'

import { useState } from 'react'
import { Description, Field, Label, Switch } from '@headlessui/react'

export default function SettingOption({
    title,
    description,
    onChange,
    value,
    type = 'switch', // switch, dropdown, input
    options = [],
}) {

    return (
        <div className="">
            <Field className="px-1 py-3">
                <Label as="h3" passive className="text-base font-semibold leading-6 text-gray-900">
                    {title}
                </Label>
                <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                    <div className="max-w-xl text-sm text-gray-500">
                        <Description>
                            {description}
                        </Description>
                    </div>
                    <div className="mt-0 flex flex-shrink-0 items-center">

                        {type == 'switch' && <Switch
                            checked={value}
                            onChange={onChange}
                            className="group inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
                        >
                            <span
                                aria-hidden="true"
                                className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                            />
                        </Switch>}

                        {type == 'dropdown' && <select
                            id="comments"
                            name="comments"
                            aria-describedby="comments-description"
                            onChange={onChange}
                            value={value}
                            // className="inline-block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            // className="inline-block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            className="group h-6 inline-flex cursor-pointer rounded-full border-2 border-transparent bg-gray-200 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >

                            {options.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>}
                    </div>
                </div>
            </Field>
        </div>
    )
}
